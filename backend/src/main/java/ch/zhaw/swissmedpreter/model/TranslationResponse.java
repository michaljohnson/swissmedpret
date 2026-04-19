package ch.zhaw.swissmedpreter.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class TranslationResponse {
    @SerializedName("original")
    private String original;

    @SerializedName("translated")
    private String translated;

    @SerializedName("detectedKeywords")
    private List<String> detectedKeywords;

    @SerializedName("timestamp")
    private String timestamp;

    public TranslationResponse() {}

    public TranslationResponse(String original, String translated, List<String> detectedKeywords, String timestamp) {
        this.original = original;
        this.translated = translated;
        this.detectedKeywords = detectedKeywords;
        this.timestamp = timestamp;
    }

    public String getOriginal() {
        return original;
    }

    public void setOriginal(String original) {
        this.original = original;
    }

    public String getTranslated() {
        return translated;
    }

    public void setTranslated(String translated) {
        this.translated = translated;
    }

    public List<String> getDetectedKeywords() {
        return detectedKeywords;
    }

    public void setDetectedKeywords(List<String> detectedKeywords) {
        this.detectedKeywords = detectedKeywords;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
