package com.swissmedpreter.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thin client for a local LibreTranslate container (http://libretranslate:5000
 * inside Docker, or any user-configured URL).
 *
 * Enabled when {@code swissmedpreter.libretranslate.url} (or env var
 * {@code SWISSMEDPRETER_LIBRETRANSLATE_URL}) is non-empty. When disabled
 * or unreachable, {@link TranslationService} silently falls back to the
 * phrasebook + lexicon substitution.
 */
@Component
public class LibreTranslateClient {

    private static final Logger log = LoggerFactory.getLogger(LibreTranslateClient.class);

    @Value("${swissmedpreter.libretranslate.url:}")
    private String baseUrl;

    @Value("${swissmedpreter.libretranslate.timeout-ms:3500}")
    private int timeoutMs;

    private RestClient restClient;
    private final AtomicBoolean reachable = new AtomicBoolean(false);
    private final Set<String> supportedLanguages = ConcurrentHashMap.newKeySet();
    /** When was the last probe attempt? Used to throttle re-probes after startup. */
    private final AtomicLong lastProbeMs = new AtomicLong(0);
    private static final long PROBE_THROTTLE_MS = 30_000;

    @PostConstruct
    public void init() {
        if (baseUrl == null || baseUrl.isBlank()) {
            log.info("LibreTranslate disabled (swissmedpreter.libretranslate.url not set) — using mock phrasebook.");
            return;
        }
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout((int) Duration.ofMillis(timeoutMs).toMillis());
        rf.setReadTimeout((int) Duration.ofMillis(timeoutMs).toMillis());
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .requestFactory(rf)
            .build();

        // Probe /languages once at startup. We don't block the whole app on
        // failure — the container may still be downloading models. Subsequent
        // translate() calls will lazily re-probe (throttled to every 30 s).
        probeLanguages();
    }

    /** Probe /languages and populate {@link #supportedLanguages}. Safe to call repeatedly. */
    private void probeLanguages() {
        if (restClient == null) return;
        lastProbeMs.set(System.currentTimeMillis());
        try {
            LanguagesEntry[] langs = restClient.get()
                .uri("/languages")
                .retrieve()
                .body(LanguagesEntry[].class);
            if (langs == null || langs.length == 0) {
                reachable.set(false);
                return;
            }
            supportedLanguages.clear();
            for (LanguagesEntry l : langs) supportedLanguages.add(l.code());
            boolean wasReachable = reachable.getAndSet(true);
            if (!wasReachable) {
                log.info("LibreTranslate online at {} — {} languages loaded: {}",
                    baseUrl, supportedLanguages.size(), supportedLanguages);
            }
        } catch (RestClientException e) {
            if (reachable.getAndSet(false)) {
                log.warn("LibreTranslate at {} became unreachable ({}).", baseUrl, e.getMessage());
            } else {
                log.debug("LibreTranslate /languages still not reachable: {}", e.getMessage());
            }
        }
    }

    /** Re-probe at most every {@value #PROBE_THROTTLE_MS} ms when we don't yet have a language list. */
    private void maybeProbe() {
        if (!supportedLanguages.isEmpty()) return;
        long now = System.currentTimeMillis();
        long last = lastProbeMs.get();
        if (now - last < PROBE_THROTTLE_MS) return;
        probeLanguages();
    }

    public boolean isConfigured() {
        return restClient != null;
    }

    public boolean isReachable() {
        return reachable.get();
    }

    public boolean supports(String langCode) {
        if (langCode == null) return false;
        // If we couldn't probe languages yet, assume supported and let the
        // call fail through to the fallback path.
        if (supportedLanguages.isEmpty()) return true;
        return supportedLanguages.contains(langCode);
    }

    public Set<String> getSupportedLanguages() {
        return Set.copyOf(supportedLanguages);
    }

    /**
     * @return translated text, or empty Optional on any failure / unsupported lang.
     */
    public Optional<String> translate(String text, String sourceLang, String targetLang) {
        if (restClient == null || text == null || text.isBlank()) return Optional.empty();
        // Lazy retry: maybe LibreTranslate just finished its model download.
        maybeProbe();
        if (!supports(sourceLang) || !supports(targetLang)) return Optional.empty();

        try {
            TranslateRequest body = new TranslateRequest(text, sourceLang, targetLang, "text");
            TranslateResponse resp = restClient.post()
                .uri("/translate")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(TranslateResponse.class);
            if (resp == null || resp.translatedText() == null || resp.translatedText().isBlank()) {
                return Optional.empty();
            }
            // If we got a response, refresh the reachability flag.
            reachable.set(true);
            return Optional.of(resp.translatedText());
        } catch (RestClientException e) {
            log.debug("LibreTranslate translate failed ({} → {}): {}", sourceLang, targetLang, e.getMessage());
            reachable.set(false);
            return Optional.empty();
        }
    }

    public record TranslateRequest(
        @JsonProperty("q") String q,
        @JsonProperty("source") String source,
        @JsonProperty("target") String target,
        @JsonProperty("format") String format
    ) {}

    public record TranslateResponse(
        @JsonProperty("translatedText") String translatedText
    ) {}

    public record LanguagesEntry(
        @JsonProperty("code") String code,
        @JsonProperty("name") String name
    ) {}
}
