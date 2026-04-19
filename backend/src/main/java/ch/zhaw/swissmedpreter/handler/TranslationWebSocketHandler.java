package ch.zhaw.swissmedpreter.handler;

import ch.zhaw.swissmedpreter.model.TranslationRequest;
import ch.zhaw.swissmedpreter.model.TranslationResponse;
import ch.zhaw.swissmedpreter.service.TranslationService;
import com.google.gson.Gson;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class TranslationWebSocketHandler extends TextWebSocketHandler {

    private final TranslationService translationService;
    private final Gson gson = new Gson();

    public TranslationWebSocketHandler(TranslationService translationService) {
        this.translationService = translationService;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            TranslationRequest request = gson.fromJson(payload, TranslationRequest.class);

            // Process translation
            TranslationResponse response = translationService.processTranslation(request);

            // Send response
            String responseJson = gson.toJson(response);
            session.sendMessage(new TextMessage(responseJson));
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            session.sendMessage(new TextMessage(gson.toJson(java.util.Map.of("error", errorMsg))));
        }
    }
}
