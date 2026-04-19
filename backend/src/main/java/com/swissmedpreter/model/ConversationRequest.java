package com.swissmedpreter.model;

public record ConversationRequest(
        String sourceLanguage,
        String targetLanguage,
        boolean handsFree,
        boolean transcriptionEnabled,
        String promptText
) {}
