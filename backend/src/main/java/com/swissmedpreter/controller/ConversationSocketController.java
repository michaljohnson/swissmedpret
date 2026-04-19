package com.swissmedpreter.controller;

import com.swissmedpreter.model.ConversationMessage;
import com.swissmedpreter.model.ConversationRequest;
import com.swissmedpreter.service.ConversationSimulationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ConversationSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationSimulationService simulationService;

    public ConversationSocketController(SimpMessagingTemplate messagingTemplate,
                                        ConversationSimulationService simulationService) {
        this.messagingTemplate = messagingTemplate;
        this.simulationService = simulationService;
    }

    @MessageMapping("/conversation.process")
    public void processConversation(ConversationRequest request) {
        if (!request.transcriptionEnabled()) {
            ConversationMessage stopped = ConversationMessage.of(
                    "System",
                    "Transcription stopped.",
                    "Transcription stopped.",
                    request.sourceLanguage(),
                    request.targetLanguage(),
                    0,
                    java.util.List.of()
            );
            messagingTemplate.convertAndSend("/topic/conversation", stopped);
            return;
        }

        ConversationMessage response = simulationService.simulate(request);
        messagingTemplate.convertAndSend("/topic/conversation", response);
    }
}
