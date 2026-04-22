package com.swissmedpreter.demo.controller;

import com.swissmedpreter.demo.model.ConversationMessage;
import com.swissmedpreter.demo.model.SimulationRequest;
import com.swissmedpreter.demo.service.SimulationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SimulationController {

    private final SimulationService simulationService;
    private final SimpMessagingTemplate messagingTemplate;

    public SimulationController(SimulationService simulationService, SimpMessagingTemplate messagingTemplate) {
        this.simulationService = simulationService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/simulate")
    public ResponseEntity<ConversationMessage> simulate(@Valid @RequestBody SimulationRequest request) {
        return ResponseEntity.ok(simulationService.simulate(request));
    }

    @GetMapping("/languages")
    public List<String> languages() {
        return List.of(
                "German", "English", "French", "Italian", "Spanish", "Portuguese", "Arabic", "Turkish", "Albanian", "Serbian",
                "Croatian", "Bosnian", "Ukrainian", "Russian", "Polish", "Romanian", "Tamil", "Tigrinya", "Farsi", "Swiss German"
        );
    }

    @GetMapping("/lexicon")
    public Map<String, Object> lexiconInfo() {
        return Map.of(
                "mode", "offline",
                "source", "mock lexicon json",
                "keywordMatching", true
        );
    }

    @MessageMapping("/conversation")
    public void relay(@Payload ConversationMessage message) {
        messagingTemplate.convertAndSend("/topic/conversation", message);
    }
}
