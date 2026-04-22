package com.swissmedpreter.demo.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ConversationMessage {
    private String id = UUID.randomUUID().toString();
    private String speaker;
    private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    private Instant timestamp = Instant.now();
    private long simulatedLatencyMs;
    private boolean handsFree;
    private List<String> detectedKeywords;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSpeaker() { return speaker; }
    public void setSpeaker(String speaker) { this.speaker = speaker; }
    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }
    public String getTranslatedText() { return translatedText; }
    public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }
    public String getSourceLanguage() { return sourceLanguage; }
    public void setSourceLanguage(String sourceLanguage) { this.sourceLanguage = sourceLanguage; }
    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public long getSimulatedLatencyMs() { return simulatedLatencyMs; }
    public void setSimulatedLatencyMs(long simulatedLatencyMs) { this.simulatedLatencyMs = simulatedLatencyMs; }
    public boolean isHandsFree() { return handsFree; }
    public void setHandsFree(boolean handsFree) { this.handsFree = handsFree; }
    public List<String> getDetectedKeywords() { return detectedKeywords; }
    public void setDetectedKeywords(List<String> detectedKeywords) { this.detectedKeywords = detectedKeywords; }
}
