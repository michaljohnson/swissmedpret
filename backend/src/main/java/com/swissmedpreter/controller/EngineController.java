package com.swissmedpreter.controller;

import com.swissmedpreter.service.LibreTranslateClient;
import com.swissmedpreter.service.PhrasebookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Read-only metadata about the active translation engine so the
 * frontend can show a meaningful status pill ("LibreTranslate online"
 * vs "Phrasebook fallback") before any translation has happened.
 */
@RestController
@RequestMapping("/api/engine")
public class EngineController {

    private final LibreTranslateClient libreTranslate;
    private final PhrasebookService phrasebookService;

    public EngineController(LibreTranslateClient libreTranslate, PhrasebookService phrasebookService) {
        this.libreTranslate = libreTranslate;
        this.phrasebookService = phrasebookService;
    }

    @GetMapping
    public Map<String, Object> info() {
        Map<String, Object> out = new LinkedHashMap<>();
        boolean lt = libreTranslate.isConfigured() && libreTranslate.isReachable();
        out.put("primary", lt ? "libretranslate" : "phrasebook");
        out.put("libretranslate", Map.of(
            "configured", libreTranslate.isConfigured(),
            "reachable", libreTranslate.isReachable(),
            "supportedLanguages", libreTranslate.getSupportedLanguages()
        ));
        out.put("phrasebook", Map.of("phrases", phrasebookService.size()));
        return out;
    }
}
