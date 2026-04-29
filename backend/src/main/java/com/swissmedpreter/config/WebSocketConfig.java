package com.swissmedpreter.config;

import com.swissmedpreter.controller.ConversationSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Wires the /ws/conversation endpoint used by the React client for
 * sub-second turn-taking detection (see SA Report Table 10).
 *
 * In production, allowed origins are restricted to the hospital
 * intranet host(s); we keep "*" here for development only.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ConversationSocketHandler conversationSocketHandler;

    public WebSocketConfig(ConversationSocketHandler conversationSocketHandler) {
        this.conversationSocketHandler = conversationSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
            .addHandler(conversationSocketHandler, "/ws/conversation")
            .setAllowedOriginPatterns("*"); // tighten for production
    }
}
