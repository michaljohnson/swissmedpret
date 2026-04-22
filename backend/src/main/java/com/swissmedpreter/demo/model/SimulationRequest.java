package com.swissmedpreter.demo.model;

import jakarta.validation.constraints.NotBlank;

public class SimulationRequest {
    @NotBlank
    private String text;
    @NotBlank
    private String sourceLanguage;
    @NotBlank
    private String targetLanguage;
    private String speaker = "doctor";
    private boolean handsFree;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getSourceLanguage() { return sourceLanguage; }
    public void setSourceLanguage(String sourceLanguage) { this.sourceLanguage = sourceLanguage; }
    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
    public String getSpeaker() { return speaker; }
    public void setSpeaker(String speaker) { this.speaker = speaker; }
    public boolean isHandsFree() { return handsFree; }
    public void setHandsFree(boolean handsFree) { this.handsFree = handsFree; }
}
