package ch.zhaw.swissmedpreter.service;

import ch.zhaw.swissmedpreter.model.TranslationRequest;
import ch.zhaw.swissmedpreter.model.TranslationResponse;
import ch.zhaw.swissmedpreter.model.LexiconEntry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TranslationService {

    @Autowired
    private LexiconService lexiconService;

    // Multilingual medical phrase dictionary: German key -> {lang -> translation}
    private static final Map<String, Map<String, String>> PHRASE_DICT = new LinkedHashMap<>();

    static {
        addPhrase("Ich habe Schmerzen", Map.of(
            "es", "Tengo dolor", "fr", "J'ai mal", "tr", "Ağrım var",
            "en", "I have pain", "it", "Ho dolore"
        ));
        addPhrase("Ich habe Schmerzen im Handgelenk", Map.of(
            "es", "Me duele la muñeca", "fr", "J'ai mal au poignet", "tr", "Bileğim ağrıyor",
            "en", "I have wrist pain", "it", "Ho dolore al polso"
        ));
        addPhrase("Mein Kopf tut weh", Map.of(
            "es", "Me duele la cabeza", "fr", "J'ai mal à la tête", "tr", "Başım ağrıyor",
            "en", "My head hurts", "it", "Mi fa male la testa"
        ));
        addPhrase("Ich habe Fieber", Map.of(
            "es", "Tengo fiebre", "fr", "J'ai de la fièvre", "tr", "Ateşim var",
            "en", "I have a fever", "it", "Ho la febbre"
        ));
        addPhrase("Mir ist übel", Map.of(
            "es", "Tengo náuseas", "fr", "J'ai la nausée", "tr", "Midem bulanıyor",
            "en", "I feel nauseous", "it", "Ho la nausea"
        ));
        addPhrase("Mein Knie tut weh", Map.of(
            "es", "Me duele la rodilla", "fr", "J'ai mal au genou", "tr", "Dizim ağrıyor",
            "en", "My knee hurts", "it", "Mi fa male il ginocchio"
        ));
        addPhrase("Ich habe Herzschmerzen", Map.of(
            "es", "Me duele el corazón", "fr", "J'ai mal au cœur", "tr", "Kalbim ağrıyor",
            "en", "I have chest pain", "it", "Ho dolore al cuore"
        ));
        addPhrase("Ich habe Rückenschmerzen", Map.of(
            "es", "Me duele la espalda", "fr", "J'ai mal au dos", "tr", "Sırtım ağrıyor",
            "en", "I have back pain", "it", "Ho mal di schiena"
        ));
        addPhrase("Ich brauche eine Tablette", Map.of(
            "es", "Necesito una pastilla", "fr", "J'ai besoin d'un comprimé", "tr", "Bir tablet lazım",
            "en", "I need a tablet", "it", "Ho bisogno di una pastiglia"
        ));
        addPhrase("Ich habe eine Allergie", Map.of(
            "es", "Tengo alergia", "fr", "J'ai une allergie", "tr", "Alerjim var",
            "en", "I have an allergy", "it", "Ho un'allergia"
        ));
    }

    private static void addPhrase(String german, Map<String, String> translations) {
        PHRASE_DICT.put(german.toLowerCase(), translations);
    }

    public TranslationResponse processTranslation(TranslationRequest request) {
        // Simulate network/AI delay between 300ms and 800ms
        long delayMs = 300 + (long)(Math.random() * 500);
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String inputText = request.getText();
        String sourceLang = request.getSourceLang();
        String targetLang = request.getTargetLang();

        // Detect keywords from the medical lexicon
        List<String> detectedKeywords = detectKeywords(inputText);

        // Translate using the phrase dictionary
        String translated = translate(inputText, sourceLang, targetLang);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);

        return new TranslationResponse(
                inputText,
                translated,
                detectedKeywords,
                timestamp
        );
    }

    private String translate(String text, String sourceLang, String targetLang) {
        String lowerText = text.toLowerCase().trim();

        // If source is German, translate to target language
        if ("de".equals(sourceLang)) {
            // Try exact match first, then partial match
            for (Map.Entry<String, Map<String, String>> entry : PHRASE_DICT.entrySet()) {
                if (lowerText.equals(entry.getKey()) || lowerText.contains(entry.getKey())) {
                    String result = entry.getValue().get(targetLang);
                    if (result != null) return result;
                    // Fallback to English if target lang not available
                    result = entry.getValue().get("en");
                    if (result != null) return result;
                }
            }
        }

        // If source is NOT German, try to find the source text in translations and return German
        if ("de".equals(targetLang)) {
            for (Map.Entry<String, Map<String, String>> entry : PHRASE_DICT.entrySet()) {
                for (Map.Entry<String, String> langEntry : entry.getValue().entrySet()) {
                    if (lowerText.equals(langEntry.getValue().toLowerCase()) ||
                        lowerText.contains(langEntry.getValue().toLowerCase())) {
                        // Return the German phrase (capitalize first letter)
                        String german = entry.getKey();
                        return german.substring(0, 1).toUpperCase() + german.substring(1);
                    }
                }
            }
        }

        // Fallback: return a generic response in the target language
        return getGenericResponse(targetLang, text);
    }

    private String getGenericResponse(String lang, String originalText) {
        Map<String, String> generic = Map.of(
            "de", "Ich verstehe. Können Sie mir mehr Details geben?",
            "es", "Entiendo. ¿Puede darme más detalles?",
            "fr", "Je comprends. Pouvez-vous me donner plus de détails?",
            "tr", "Anlıyorum. Daha fazla detay verebilir misiniz?",
            "en", "I understand. Can you give me more details?",
            "it", "Capisco. Può darmi più dettagli?"
        );
        return generic.getOrDefault(lang, originalText);
    }

    private List<String> detectKeywords(String text) {
        List<String> keywords = new ArrayList<>();
        List<LexiconEntry> allEntries = lexiconService.getAll();
        String lowerText = text.toLowerCase();

        for (LexiconEntry entry : allEntries) {
            if (lowerText.contains(entry.getGerman().toLowerCase())) {
                keywords.add(entry.getGerman());
            }
        }

        return keywords;
    }
}
