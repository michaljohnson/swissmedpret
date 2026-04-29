package com.swissmedpreter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.swissmedpreter.model.Domain.LexiconEntry;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

/**
 * Loads the medical-image lexicon (lexicon.json) at startup and exposes
 * lookup methods used by the TranslationService and the REST controller.
 *
 * The file is shipped inside the deployable JAR so the lexicon is
 * available even when the container is air-gapped.
 */
@Service
public class LexiconService {

    private List<LexiconEntry> entries = new ArrayList<>();

    @PostConstruct
    public void loadFromClasspath() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        try (InputStream in = new ClassPathResource("lexicon.json").getInputStream()) {
            JsonNode root = mapper.readTree(in);
            JsonNode arr = root.get("entries");
            List<LexiconEntry> loaded = new ArrayList<>();
            for (JsonNode node : arr) {
                List<String> keywords = new ArrayList<>();
                node.get("keywords").forEach(k -> keywords.add(k.asText()));
                Map<String, String> translations = new LinkedHashMap<>();
                node.get("translations").fields().forEachRemaining(
                    e -> translations.put(e.getKey(), e.getValue().asText())
                );
                loaded.add(new LexiconEntry(
                    node.get("id").asText(),
                    node.path("category").asText("general"),
                    keywords,
                    translations,
                    node.path("pictogram").asText(node.get("id").asText())
                ));
            }
            this.entries = List.copyOf(loaded);
        }
    }

    public List<LexiconEntry> allEntries() {
        return entries;
    }

    public Optional<LexiconEntry> findById(String id) {
        return entries.stream().filter(e -> e.id().equals(id)).findFirst();
    }

    /** Return entries whose keyword/translation set intersects the given text. */
    public List<LexiconEntry> detect(String text, String langCode) {
        if (text == null || text.isBlank()) return List.of();
        String lower = text.toLowerCase(Locale.ROOT);
        List<LexiconEntry> hits = new ArrayList<>();
        for (LexiconEntry e : entries) {
            boolean matched = false;
            for (String kw : e.keywords()) {
                if (lower.contains(kw.toLowerCase(Locale.ROOT))) { matched = true; break; }
            }
            if (!matched) {
                String t = e.translations().get(langCode);
                if (t != null && lower.contains(t.toLowerCase(Locale.ROOT))) matched = true;
            }
            if (matched) hits.add(e);
        }
        return hits;
    }

    /** Free-text search across keywords and translations for the offline lexicon UI. */
    public List<LexiconEntry> search(String query) {
        if (query == null || query.isBlank()) return entries;
        String q = query.toLowerCase(Locale.ROOT);
        List<LexiconEntry> out = new ArrayList<>();
        for (LexiconEntry e : entries) {
            boolean hit = e.keywords().stream().anyMatch(k -> k.toLowerCase(Locale.ROOT).contains(q))
                       || e.translations().values().stream().anyMatch(v -> v.toLowerCase(Locale.ROOT).contains(q));
            if (hit) out.add(e);
        }
        return out;
    }
}
