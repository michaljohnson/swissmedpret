package ch.zhaw.swissmedpreter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversation")
public class ConversationController {

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startConversation() {
        Map<String, Object> response = new HashMap<>();
        String sessionId = UUID.randomUUID().toString();
        response.put("sessionId", sessionId);
        response.put("status", "started");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, Object>> stopConversation() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "stopped");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
