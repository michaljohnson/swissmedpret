package com.swissmedpreter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;

/**
 * Mock phrasebook used by {@link TranslationService} to translate full
 * sentences in the prototype. In production this would be replaced by
 * the on-prem LLM call. The phrasebook is keyed by a normalized form
 * of the source sentence so trivial differences (trailing punctuation,
 * casing, extra whitespace) still hit.
 */
@Service
public class PhrasebookService {

    /** sourceLang → (normalized sentence → phrase index). */
    private final Map<String, Map<String, Integer>> indexByLang = new HashMap<>();
    /** All phrase records in load order (each is langCode → text). */
    private List<Map<String, String>> phrases = new ArrayList<>();

    @PostConstruct
    public void load() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        try (InputStream in = new ClassPathResource("phrasebook.json").getInputStream()) {
            JsonNode root = mapper.readTree(in);
            JsonNode arr = root.get("phrases");
            if (arr == null || !arr.isArray()) return;

            List<Map<String, String>> loaded = new ArrayList<>();
            for (JsonNode node : arr) {
                JsonNode translations = node.get("translations");
                if (translations == null) continue;
                Map<String, String> langMap = new LinkedHashMap<>();
                translations.fields().forEachRemaining(e -> langMap.put(e.getKey(), e.getValue().asText()));
                int idx = loaded.size();
                loaded.add(langMap);
                for (Map.Entry<String, String> entry : langMap.entrySet()) {
                    indexByLang
                        .computeIfAbsent(entry.getKey(), k -> new HashMap<>())
                        .put(normalize(entry.getValue()), idx);
                }
            }
            this.phrases = List.copyOf(loaded);
        }
    }

    /**
     * Look up an exact (normalized) sentence in the source language and
     * return its translation in the target language, if any.
     */
    public Optional<String> lookup(String text, String sourceLang, String targetLang) {
        if (text == null || sourceLang == null || targetLang == null) return Optional.empty();
        Map<String, Integer> srcIdx = indexByLang.get(sourceLang);
        if (srcIdx == null) return Optional.empty();
        Integer phraseIdx = srcIdx.get(normalize(text));
        if (phraseIdx == null) return Optional.empty();
        String translated = phrases.get(phraseIdx).get(targetLang);
        return Optional.ofNullable(translated);
    }

    public int size() {
        return phrases.size();
    }

    /**
     * Normalize a sentence for matching: lower-case, NFKC, collapse
     * whitespace, strip trailing punctuation like .?!,;:。؟ etc.
     */
    private static String normalize(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFKC).toLowerCase(Locale.ROOT).trim();
        n = n.replaceAll("\\s+", " ");
        // strip trailing punctuation in common scripts
        n = n.replaceAll("[\\.!?,;:。·؟،]+$", "");
        return n;
    }
}
