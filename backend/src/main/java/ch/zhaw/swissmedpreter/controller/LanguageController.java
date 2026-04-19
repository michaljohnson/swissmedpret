package ch.zhaw.swissmedpreter.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/languages")
public class LanguageController {

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getLanguages() {
        List<Map<String, String>> languages = Arrays.asList(
                createLanguage("de", "German"),
                createLanguage("en", "English"),
                createLanguage("fr", "French"),
                createLanguage("it", "Italian"),
                createLanguage("es", "Spanish"),
                createLanguage("pt", "Portuguese"),
                createLanguage("nl", "Dutch"),
                createLanguage("pl", "Polish"),
                createLanguage("ru", "Russian"),
                createLanguage("ar", "Arabic"),
                createLanguage("zh", "Chinese"),
                createLanguage("ja", "Japanese"),
                createLanguage("ko", "Korean"),
                createLanguage("th", "Thai"),
                createLanguage("tr", "Turkish"),
                createLanguage("vi", "Vietnamese"),
                createLanguage("id", "Indonesian"),
                createLanguage("hi", "Hindi"),
                createLanguage("bn", "Bengali"),
                createLanguage("pa", "Punjabi")
        );
        return ResponseEntity.ok(languages);
    }

    private Map<String, String> createLanguage(String code, String name) {
        Map<String, String> lang = new HashMap<>();
        lang.put("code", code);
        lang.put("name", name);
        return lang;
    }
}
