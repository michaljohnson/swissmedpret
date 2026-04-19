package com.swissmedpreter.model;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

public record ConversationMessage(
        String id,
        String speaker,
        String originalText,
        String translatedText,
        String sourceLanguage,
        String targetLanguage,
        long latencyMs,
        List<String> detectedKeywords,
        String timestamp
) {
    public static ConversationMessage of(String speaker,
                                         String originalText,
                                         String translatedText,
                                         String sourceLanguage,
                                         String targetLanguage,
                                         long latencyMs,
                                         List<String> detectedKeywords) {
        return new ConversationMessage(
                UUID.randomUUID().toString(),
                speaker,
                originalText,
                translatedText,
                sourceLanguage,
                targetLanguage,
                latencyMs,
                detectedKeywords,
                LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))
        );
    }
}
