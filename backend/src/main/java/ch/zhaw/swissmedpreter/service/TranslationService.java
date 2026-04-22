package ch.zhaw.swissmedpreter.service;

import ch.zhaw.swissmedpreter.model.TranslationRequest;
import ch.zhaw.swissmedpreter.model.TranslationResponse;
import ch.zhaw.swissmedpreter.model.LexiconEntry;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TranslationService {

    @Autowired
    private LexiconService lexiconService;

    @Value("${deepl.api.key:}")
    private String deeplApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final Gson gson = new Gson();

    // DeepL Free API endpoint
    private static final String DEEPL_FREE_URL = "https://api-free.deepl.com/v2/translate";

    public TranslationResponse processTranslation(TranslationRequest request) {
        String inputText = request.getText();
        String sourceLang = request.getSourceLang();
        String targetLang = request.getTargetLang();

        // Detect keywords from the medical lexicon
        List<String> detectedKeywords = detectKeywords(inputText);

        // Translate via DeepL API
        String translated = translateViaDeepL(inputText, sourceLang, targetLang);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);

        return new TranslationResponse(
                inputText,
                translated,
                detectedKeywords,
                timestamp
        );
    }

    private String translateViaDeepL(String text, String sourceLang, String targetLang) {
        if (deeplApiKey == null || deeplApiKey.isEmpty()) {
            System.err.println("DeepL API key not configured. Set DEEPL_API_KEY environment variable.");
            return "[No API key] " + text;
        }

        try {
            // DeepL uses uppercase language codes, and "EN" not "en"
            String sourceUpper = mapToDeepLLang(sourceLang);
            String targetUpper = mapToDeepLLang(targetLang);

            // Build form-encoded body
            String body = "text=" + URLEncoder.encode(text, StandardCharsets.UTF_8)
                    + "&source_lang=" + URLEncoder.encode(sourceUpper, StandardCharsets.UTF_8)
                    + "&target_lang=" + URLEncoder.encode(targetUpper, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(DEEPL_FREE_URL))
                    .header("Authorization", "DeepL-Auth-Key " + deeplApiKey)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonObject json = gson.fromJson(response.body(), JsonObject.class);
                JsonArray translations = json.getAsJsonArray("translations");
                if (translations != null && translations.size() > 0) {
                    return translations.get(0).getAsJsonObject().get("text").getAsString();
                }
            } else {
                System.err.println("DeepL API error: HTTP " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            System.err.println("DeepL API error: " + e.getMessage());
        }

        return "[Translation unavailable] " + text;
    }

    /**
     * Map our language codes to DeepL format.
     * DeepL uses uppercase and some specific codes (e.g. "EN-US", "PT-BR").
     */
    private String mapToDeepLLang(String lang) {
        if (lang == null) return "EN";
        switch (lang.toLowerCase()) {
            case "en": return "EN";
            case "de": return "DE";
            case "es": return "ES";
            case "fr": return "FR";
            case "it": return "IT";
            case "ja": return "JA";
            case "pt": return "PT";
            case "ar": return "AR";
            case "tr": return "TR";
            default: return lang.toUpperCase();
        }
    }

    private List<String> detectKeywords(String text) {
        List<String> keywords = new ArrayList<>();
        List<LexiconEntry> allEntries = lexiconService.getAll();
        String lowerText = text.toLowerCase();

        for (LexiconEntry entry : allEntries) {
            if (lowerText.contains(entry.getGerman().toLowerCase())) {
                keywords.add(entry.getGerman());
            }
        }

        return keywords;
    }
}
