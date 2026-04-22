package com.swissmedpreter.demo.service;

import com.swissmedpreter.demo.model.ConversationMessage;
import com.swissmedpreter.demo.model.SimulationRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SimulationService {

    private static final Map<String, String> DICTIONARY = new LinkedHashMap<>() {{
        put("wrist", "handgelenk");
        put("infection", "infektion");
        put("head", "kopf");
        put("fever", "fieber");
        put("heart", "herz");
        put("lung", "lunge");
        put("pain", "schmerzen");
        put("morning", "morgen");
    }};

    public ConversationMessage simulate(SimulationRequest request) {
        ConversationMessage message = new ConversationMessage();
        message.setSpeaker(request.getSpeaker());
        message.setOriginalText(request.getText());
        message.setTranslatedText(translate(request.getText(), request.getSourceLanguage(), request.getTargetLanguage()));
        message.setSourceLanguage(request.getSourceLanguage());
        message.setTargetLanguage(request.getTargetLanguage());
        message.setHandsFree(request.isHandsFree());
        message.setTimestamp(Instant.now());
        message.setDetectedKeywords(extractKeywords(request.getText()));
        message.setSimulatedLatencyMs(request.isHandsFree() ? 780 : 1280);
        return message;
    }

    private List<String> extractKeywords(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        return DICTIONARY.keySet().stream()
                .filter(lower::contains)
                .collect(Collectors.toList());
    }

    private String translate(String text, String sourceLanguage, String targetLanguage) {
        String translated = text;
        for (Map.Entry<String, String> entry : DICTIONARY.entrySet()) {
            translated = translated.replaceAll("(?i)\\b" + entry.getKey() + "\\b", entry.getValue());
        }
        return "[" + targetLanguage + "] " + translated;
    }
}
