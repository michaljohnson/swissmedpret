package com.swissmedpreter.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.swissmedpreter.service.TranslationService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Real-time conversation channel for the React client.
 *
 * Inbound messages (JSON) — type field discriminates:
 *   { "type": "speak", "speaker": "STAFF|PATIENT",
 *     "text": "...", "sourceLang": "de", "targetLang": "ar" }
 *   { "type": "join",  "caseNumber": "..." }
 *
 * Outbound messages:
 *   { "type": "translation",
 *     "messageId": "...", "translation": "...",
 *     "detectedTerms": [...], "latencyMs": 920, "issuedAt": "..." }
 *   { "type": "ack",   "caseNumber": "..." }
 *
 * In a multi-device user-to-user conversation (UC3), the same case
 * number is used as the session key — incoming utterances from one
 * device are broadcast to every other device in the same session.
 */
@Component
public class ConversationSocketHandler extends TextWebSocketHandler {

    private final TranslationService translationService;
    private final ObjectMapper mapper = new ObjectMapper();

    /** sessionId → caseNumber. */
    private final Map<String, String> sessionCase = new ConcurrentHashMap<>();
    /** caseNumber → set of sessions. */
    private final Map<String, java.util.Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    public ConversationSocketHandler(TranslationService translationService) {
        this.translationService = translationService;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode root = mapper.readTree(message.getPayload());
        String type = root.path("type").asText("");

        switch (type) {
            case "join" -> handleJoin(session, root);
            case "speak" -> handleSpeak(session, root);
            default -> session.sendMessage(error("Unknown message type: " + type));
        }
    }

    private void handleJoin(WebSocketSession session, JsonNode root) throws Exception {
        String caseNumber = root.path("caseNumber").asText("ANON");
        sessionCase.put(session.getId(), caseNumber);
        rooms.computeIfAbsent(caseNumber, k -> java.util.concurrent.ConcurrentHashMap.newKeySet()).add(session);

        ObjectNode ack = mapper.createObjectNode();
        ack.put("type", "ack");
        ack.put("caseNumber", caseNumber);
        ack.put("issuedAt", Instant.now().toString());
        session.sendMessage(new TextMessage(ack.toString()));
    }

    private void handleSpeak(WebSocketSession session, JsonNode root) throws Exception {
        String caseNumber = sessionCase.getOrDefault(session.getId(), "ANON");
        String text = root.path("text").asText("");
        String src = root.path("sourceLang").asText("de");
        String tgt = root.path("targetLang").asText("en");
        String speaker = root.path("speaker").asText("STAFF");
        UUID messageId = UUID.randomUUID();

        // Mirror the original utterance to the room immediately so the
        // counterpart sees the live transcript before translation arrives.
        ObjectNode original = mapper.createObjectNode();
        original.put("type", "transcript");
        original.put("messageId", messageId.toString());
        original.put("speaker", speaker);
        original.put("text", text);
        original.put("sourceLang", src);
        original.put("targetLang", tgt);
        original.put("issuedAt", Instant.now().toString());
        broadcast(caseNumber, original);

        // Off-load to a worker thread so the socket stays responsive
        // for further utterances while the LLM works.
        new Thread(() -> {
            try {
                var result = translationService.translate(text, src, tgt);
                ObjectNode out = mapper.createObjectNode();
                out.put("type", "translation");
                out.put("messageId", messageId.toString());
                out.put("translation", result.translation());
                out.put("latencyMs", result.latencyMs());
                out.put("engine", result.engine());
                out.put("issuedAt", Instant.now().toString());
                var arr = out.putArray("detectedTerms");
                result.detectedTerms().forEach(arr::add);
                broadcast(caseNumber, out);
            } catch (Exception e) {
                // log; in production wired through SLF4J
            }
        }, "translate-" + messageId).start();
    }

    private void broadcast(String caseNumber, ObjectNode payload) {
        var room = rooms.get(caseNumber);
        if (room == null) return;
        TextMessage tm = new TextMessage(payload.toString());
        for (WebSocketSession s : room) {
            if (s.isOpen()) {
                try { s.sendMessage(tm); } catch (Exception ignored) {}
            }
        }
    }

    private TextMessage error(String msg) {
        ObjectNode n = mapper.createObjectNode();
        n.put("type", "error");
        n.put("message", msg);
        return new TextMessage(n.toString());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String caseNumber = sessionCase.remove(session.getId());
        if (caseNumber != null) {
            var room = rooms.get(caseNumber);
            if (room != null) {
                room.remove(session);
                if (room.isEmpty()) rooms.remove(caseNumber);
            }
        }
    }
}
