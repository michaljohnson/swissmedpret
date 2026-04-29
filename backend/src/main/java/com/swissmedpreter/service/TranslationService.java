package com.swissmedpreter.service;

import com.swissmedpreter.model.Domain.LexiconEntry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Simulates the on-prem LLM container exposed at, e.g.,
 *   http://ai-translate.internal:8000/v1/translate
 *
 * In production this class would wrap a WebClient call to that
 * endpoint. The mock returns within 700–1400 ms so the full pipeline
 * stays comfortably under the 5 s end-to-end target (Q2, R18).
 *
 * Translation strategy in the mock:
 *   - Substitute known medical terms via the lexicon.
 *   - Leave the rest of the text in the source language; a real LLM
 *     would do free translation.
 */
@Service
public class TranslationService {

    private final LexiconService lexiconService;

    public TranslationService(LexiconService lexiconService) {
        this.lexiconService = lexiconService;
    }

    public TranslationResult translate(String text, String sourceLang, String targetLang) {
        long start = System.currentTimeMillis();
        simulateNetworkLatency();

        if (sourceLang.equals(targetLang)) {
            return new TranslationResult(text, List.of(), System.currentTimeMillis() - start);
        }

        String translated = text;
        List<String> detected = new ArrayList<>();

        for (LexiconEntry entry : lexiconService.allEntries()) {
            String sourceWord = entry.translations().get(sourceLang);
            String targetWord = entry.translations().get(targetLang);
            if (sourceWord == null || targetWord == null) continue;

            // Word-boundary, case-insensitive replace.
            String regex = "(?i)\\b" + java.util.regex.Pattern.quote(sourceWord) + "\\b";
            if (translated.toLowerCase(Locale.ROOT).contains(sourceWord.toLowerCase(Locale.ROOT))) {
                translated = translated.replaceAll(regex, targetWord);
                detected.add(entry.id());
            }
        }

        long latency = System.currentTimeMillis() - start;
        return new TranslationResult(translated, detected, latency);
    }

    /** 700–1400 ms — well under the 2 s component-level budget. */
    private void simulateNetworkLatency() {
        try {
            Thread.sleep(700 + ThreadLocalRandom.current().nextInt(700));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public record TranslationResult(String translation, List<String> detectedTerms, long latencyMs) {}
}
