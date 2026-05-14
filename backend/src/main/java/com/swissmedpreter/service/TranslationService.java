package com.swissmedpreter.service;

import com.swissmedpreter.model.Domain.LexiconEntry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Routes translation requests through (in order):
 *   1. LibreTranslate — real on-prem free translation engine when configured
 *      and reachable. See {@link LibreTranslateClient}.
 *   2. Phrasebook — exact match against a small set of common medical phrases.
 *   3. Lexicon substitution — replaces known medical terms in-place.
 *   4. Passthrough — return the original text untouched.
 *
 * Whichever step produces the result is reported back in {@code engine} so
 * the UI can show which engine actually handled the utterance.
 */
@Service
public class TranslationService {

    private final LexiconService lexiconService;
    private final PhrasebookService phrasebookService;
    private final LibreTranslateClient libreTranslate;

    public TranslationService(LexiconService lexiconService,
                              PhrasebookService phrasebookService,
                              LibreTranslateClient libreTranslate) {
        this.lexiconService = lexiconService;
        this.phrasebookService = phrasebookService;
        this.libreTranslate = libreTranslate;
    }

    public TranslationResult translate(String text, String sourceLang, String targetLang) {
        long start = System.currentTimeMillis();
        List<String> detected = detectTerms(text, sourceLang);

        if (text == null || text.isBlank() || sourceLang == null || targetLang == null
                || sourceLang.equals(targetLang)) {
            return new TranslationResult(text, detected, System.currentTimeMillis() - start, Engine.PASSTHROUGH.id);
        }

        // 1) LibreTranslate (real engine)
        if (libreTranslate.isConfigured()) {
            Optional<String> live = libreTranslate.translate(text, sourceLang, targetLang);
            if (live.isPresent()) {
                return new TranslationResult(live.get(), detected, System.currentTimeMillis() - start, Engine.LIBRETRANSLATE.id);
            }
        }

        // Without LibreTranslate the mock layer adds artificial latency so the
        // UX matches the production target (700–1400 ms).
        simulateNetworkLatency();

        // 2) Phrasebook lookup
        Optional<String> phrase = phrasebookService.lookup(text, sourceLang, targetLang);
        if (phrase.isPresent()) {
            return new TranslationResult(phrase.get(), detected, System.currentTimeMillis() - start, Engine.PHRASEBOOK.id);
        }

        // 3) Lexicon term substitution
        String translated = substituteLexiconTerms(text, sourceLang, targetLang);
        if (!translated.equals(text)) {
            return new TranslationResult(translated, detected, System.currentTimeMillis() - start, Engine.LEXICON.id);
        }

        // 4) Passthrough
        return new TranslationResult(text, detected, System.currentTimeMillis() - start, Engine.PASSTHROUGH.id);
    }

    private String substituteLexiconTerms(String text, String sourceLang, String targetLang) {
        String translated = text;
        for (LexiconEntry entry : lexiconService.allEntries()) {
            String sourceWord = entry.translations().get(sourceLang);
            String targetWord = entry.translations().get(targetLang);
            if (sourceWord == null || targetWord == null) continue;
            String regex = "(?iu)\\b" + java.util.regex.Pattern.quote(sourceWord) + "\\b";
            if (translated.toLowerCase(Locale.ROOT).contains(sourceWord.toLowerCase(Locale.ROOT))) {
                translated = translated.replaceAll(regex, targetWord);
            }
        }
        return translated;
    }

    /**
     * Keyword detection over the source text. Short keywords (≤4 chars) must
     * match at a word boundary to avoid false positives like Turkish "kan"
     * (blood) matching inside the German word "kann". Longer keywords are
     * matched as substrings so German compounds like "Bauchschmerzen" still
     * pull both "bauch" (stomach) and "schmerz" (pain).
     */
    private List<String> detectTerms(String text, String langCode) {
        List<String> ids = new ArrayList<>();
        if (text == null || text.isBlank()) return ids;
        String lower = text.toLowerCase(Locale.ROOT);
        for (LexiconEntry e : lexiconService.allEntries()) {
            boolean matched = matchesAny(lower, e.keywords());
            if (!matched) {
                String t = e.translations().get(langCode);
                if (t != null && matchesAny(lower, List.of(t))) matched = true;
            }
            if (matched) ids.add(e.id());
        }
        return ids;
    }

    private static boolean matchesAny(String lowerHaystack, List<String> needles) {
        for (String n : needles) {
            if (n == null || n.isBlank()) continue;
            String low = n.toLowerCase(Locale.ROOT);
            if (low.length() <= 4) {
                if (java.util.regex.Pattern.compile("\\b" + java.util.regex.Pattern.quote(low) + "\\b",
                        java.util.regex.Pattern.UNICODE_CHARACTER_CLASS).matcher(lowerHaystack).find()) {
                    return true;
                }
            } else if (lowerHaystack.contains(low)) {
                return true;
            }
        }
        return false;
    }

    private void simulateNetworkLatency() {
        try {
            Thread.sleep(700 + ThreadLocalRandom.current().nextInt(700));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public enum Engine {
        LIBRETRANSLATE("libretranslate"),
        PHRASEBOOK("phrasebook"),
        LEXICON("lexicon"),
        PASSTHROUGH("passthrough");

        public final String id;
        Engine(String id) { this.id = id; }
    }

    public record TranslationResult(String translation, List<String> detectedTerms, long latencyMs, String engine) {}
}
