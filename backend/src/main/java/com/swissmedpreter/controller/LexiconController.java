package com.swissmedpreter.controller;

import com.swissmedpreter.model.LexiconEntry;
import com.swissmedpreter.service.LexiconService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LexiconController {
    private final LexiconService lexiconService;

    public LexiconController(LexiconService lexiconService) {
        this.lexiconService = lexiconService;
    }

    @GetMapping("/lexicon")
    public List<LexiconEntry> getLexicon() {
        return lexiconService.getLexicon();
    }

    @GetMapping("/languages")
    public List<String> getLanguages() {
        return List.of(
                "German", "French", "Italian", "English", "Spanish", "Portuguese", "Arabic", "Turkish", "Albanian", "Serbian",
                "Croatian", "Bosnian", "Ukrainian", "Russian", "Polish", "Romanian", "Tamil", "Hindi", "Mandarin", "Tigrinya"
        );
    }
}
