package com.swissmedpreter.service;

import com.swissmedpreter.model.ConversationMessage;
import com.swissmedpreter.model.ConversationRequest;
import com.swissmedpreter.model.LexiconEntry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

@Service
public class ConversationSimulationService {
    private final LexiconService lexiconService;
    private final Random random = new Random();

    private static final Map<String, String> TRANSLATION_PREFIX = Map.ofEntries(
            Map.entry("English", "Translated"),
            Map.entry("German", "Übersetzt"),
            Map.entry("French", "Traduit"),
            Map.entry("Italian", "Tradotto"),
            Map.entry("Spanish", "Traducido"),
            Map.entry("Portuguese", "Traduzido"),
            Map.entry("Arabic", "مترجم"),
            Map.entry("Turkish", "Çevrildi"),
            Map.entry("Albanian", "Përkthyer"),
            Map.entry("Serbian", "Преведено"),
            Map.entry("Croatian", "Prevedeno"),
            Map.entry("Bosnian", "Prevedeno"),
            Map.entry("Ukrainian", "Перекладено"),
            Map.entry("Russian", "Переведено"),
            Map.entry("Polish", "Przetłumaczone"),
            Map.entry("Romanian", "Tradus"),
            Map.entry("Tamil", "மொழிபெயர்ப்பு"),
            Map.entry("Hindi", "अनुवादित"),
            Map.entry("Mandarin", "已翻译"),
            Map.entry("Tigrinya", "ዝተተርጎመ")
    );

    public ConversationSimulationService(LexiconService lexiconService) {
        this.lexiconService = lexiconService;
    }

    public ConversationMessage simulate(ConversationRequest request) {
        String original = request.promptText() == null || request.promptText().isBlank()
                ? "Please describe your symptoms so I can help you."
                : request.promptText();
        List<String> keywords = detectKeywords(original);
        String translatedText = "%s (%s): %s".formatted(
                TRANSLATION_PREFIX.getOrDefault(request.targetLanguage(), "Translated"),
                request.targetLanguage(),
                original
        );
        long latencyMs = 550 + random.nextInt(1200);
        String speaker = request.handsFree() ? "System" : (random.nextBoolean() ? "Doctor" : "Patient");
        return ConversationMessage.of(
                speaker,
                original,
                translatedText,
                request.sourceLanguage(),
                request.targetLanguage(),
                latencyMs,
                keywords
        );
    }

    private List<String> detectKeywords(String text) {
        String normalized = text.toLowerCase(Locale.ROOT);
        List<String> detected = new ArrayList<>();
        for (LexiconEntry entry : lexiconService.getLexicon()) {
            if (normalized.contains(entry.term().toLowerCase(Locale.ROOT))) {
                detected.add(entry.term());
            }
        }
        return detected;
    }
}
