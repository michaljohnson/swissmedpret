package com.swissmedpreter.controller;

import com.swissmedpreter.model.Domain.TranslationRequest;
import com.swissmedpreter.model.Domain.TranslationResponse;
import com.swissmedpreter.service.TranslationService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST entry point for one-shot translation requests. The interactive
 * conversation flow normally uses the WebSocket path for lower latency,
 * but the REST endpoint is retained for:
 *   - simple test harnesses
 *   - clients that cannot hold a WebSocket open (low-end tablets)
 *   - the OCR document-translation flow (R08, R15)
 */
@RestController
@RequestMapping("/api/conversation")
public class ConversationController {

    private final TranslationService translationService;

    public ConversationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping("/translate")
    public TranslationResponse translate(@RequestBody TranslationRequest req) {
        var result = translationService.translate(req.text(), req.sourceLang(), req.targetLang());
        return new TranslationResponse(
            UUID.randomUUID(),
            result.translation(),
            result.detectedTerms(),
            result.latencyMs()
        );
    }
}
