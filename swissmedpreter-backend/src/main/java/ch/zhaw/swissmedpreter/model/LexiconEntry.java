package ch.zhaw.swissmedpreter.model;

import com.google.gson.annotations.SerializedName;

public class LexiconEntry {
    @SerializedName("german")
    private String german;

    @SerializedName("english")
    private String english;

    @SerializedName("pictogramUrl")
    private String pictogramUrl;

    @SerializedName("category")
    private String category;

    public LexiconEntry() {}

    public LexiconEntry(String german, String english, String pictogramUrl, String category) {
        this.german = german;
        this.english = english;
        this.pictogramUrl = pictogramUrl;
        this.category = category;
    }

    public String getGerman() {
        return german;
    }

    public void setGerman(String german) {
        this.german = german;
    }

    public String getEnglish() {
        return english;
    }

    public void setEnglish(String english) {
        this.english = english;
    }

    public String getPictogramUrl() {
        return pictogramUrl;
    }

    public void setPictogramUrl(String pictogramUrl) {
        this.pictogramUrl = pictogramUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
