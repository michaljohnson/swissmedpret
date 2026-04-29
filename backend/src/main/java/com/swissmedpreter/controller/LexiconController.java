package com.swissmedpreter.controller;

import com.swissmedpreter.model.Domain.LexiconEntry;
import com.swissmedpreter.service.LexiconService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Read-only REST endpoint that ships the medical lexicon to the
 * client. Cached aggressively by the service worker so the client
 * keeps a working pictogram catalogue even when offline (R07, R22).
 */
@RestController
@RequestMapping("/api/lexicon")
public class LexiconController {

    private final LexiconService lexiconService;

    public LexiconController(LexiconService lexiconService) {
        this.lexiconService = lexiconService;
    }

    @GetMapping
    public List<LexiconEntry> list(@RequestParam(required = false) String q) {
        return q == null ? lexiconService.allEntries() : lexiconService.search(q);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LexiconEntry> byId(@PathVariable String id) {
        return lexiconService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
