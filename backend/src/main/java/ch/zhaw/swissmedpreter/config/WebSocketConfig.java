package ch.zhaw.swissmedpreter.config;

import ch.zhaw.swissmedpreter.handler.TranslationWebSocketHandler;
import ch.zhaw.swissmedpreter.service.TranslationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final TranslationService translationService;

    public WebSocketConfig(TranslationService translationService) {
        this.translationService = translationService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(translationWebSocketHandler(), "/ws/conversation")
                .setAllowedOrigins("*");
    }

    @Bean
    public WebSocketHandler translationWebSocketHandler() {
        return new TranslationWebSocketHandler(translationService);
    }
}
