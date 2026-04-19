package ch.zhaw.swissmedpreter.controller;

import ch.zhaw.swissmedpreter.model.LexiconEntry;
import ch.zhaw.swissmedpreter.service.LexiconService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lexicon")
public class LexiconController {

    @Autowired
    private LexiconService lexiconService;

    @GetMapping("/search")
    public ResponseEntity<List<LexiconEntry>> search(@RequestParam String term) {
        List<LexiconEntry> results = lexiconService.search(term);
        return ResponseEntity.ok(results);
    }
}
