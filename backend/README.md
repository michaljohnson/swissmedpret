# SwissMedPreter Backend

A Spring Boot 2.7.x REST and WebSocket backend for the SwissMedPreter medical translation application.

## Project Overview

SwissMedPreter provides real-time medical translation services with a medical lexicon database containing pictogram references for 15 medical terms across multiple languages.

## Requirements

- Java 11 or higher
- Gradle 7.6.1 or higher (wrapper included)

## Project Structure

```
swissmedpreter-backend/
├── build.gradle                    # Gradle build configuration
├── settings.gradle                 # Gradle settings
├── gradlew                         # Gradle wrapper (Unix/Linux/Mac)
├── gradlew.bat                     # Gradle wrapper (Windows)
├── src/main/java/ch/zhaw/swissmedpreter/
│   ├── SwissMedPreterApplication.java    # Spring Boot main application
│   ├── config/
│   │   ├── CorsConfig.java              # CORS configuration (allows all origins)
│   │   └── WebSocketConfig.java         # WebSocket endpoint configuration
│   ├── controller/
│   │   ├── ConversationController.java  # REST endpoints for conversation management
│   │   ├── LexiconController.java       # REST endpoints for medical lexicon search
│   │   └── LanguageController.java      # REST endpoints for language support
│   ├── handler/
│   │   └── TranslationWebSocketHandler.java # WebSocket message handler
│   ├── model/
│   │   ├── TranslationRequest.java      # Model for incoming translation requests
│   │   ├── TranslationResponse.java     # Model for translation responses
│   │   └── LexiconEntry.java            # Model for medical lexicon entries
│   └── service/
│       ├── LexiconService.java          # Business logic for lexicon operations
│       └── TranslationService.java      # Business logic for translation processing
└── src/main/resources/
    ├── application.properties           # Spring Boot configuration
    └── lexicon.json                     # Medical lexicon database (15 terms)
```

## Features

### REST Endpoints

1. **Lexicon Search**
   - Endpoint: `GET /api/lexicon/search?term={keyword}`
   - Returns: List of matching medical terms with English translation and pictogram URLs
   - Example: `GET /api/lexicon/search?term=Handgelenk`

2. **Language Support**
   - Endpoint: `GET /api/languages`
   - Returns: List of 20 supported languages (code and name pairs)
   - Languages include: German, English, French, Italian, Spanish, Portuguese, Dutch, Polish, Russian, Arabic, Chinese, Japanese, Korean, Thai, Turkish, Vietnamese, Indonesian, Hindi, Bengali, Punjabi

3. **Conversation Management**
   - `POST /api/conversation/start` - Initiates a new conversation session, returns sessionId
   - `POST /api/conversation/stop` - Closes a conversation session

### WebSocket Endpoint

- **Endpoint**: `ws://localhost:8080/ws/conversation`
- **Message Format**: JSON with translation request
  ```json
  {
    "text": "Ich habe Schmerzen im Handgelenk",
    "sourceLang": "de",
    "targetLang": "ar"
  }
  ```
- **Response Format**: JSON with translation response
  ```json
  {
    "original": "Ich habe Schmerzen im Handgelenk",
    "translated": "[TRANSLATED to ar]: Ich habe Schmerzen im Handgelenk",
    "detectedKeywords": ["Handgelenk", "Schmerzen"],
    "timestamp": "2026-04-15T14:30:00"
  }
```

**Behavior:**
- Simulates a random delay between 500ms and 1500ms per message
- Detects medical keywords from the built-in lexicon
- Returns translation with prefix `[TRANSLATED to {targetLang}]:`

### Medical Lexicon

The lexicon contains 15 medical terms with German/English mappings and pictogram references:

**Body Parts (Körperteile):** Handgelenk, Kopf, Herz, Lunge, Magen, Knie, Rücken

**Symptoms (Symptome):** Fieber, Schmerzen, Übelkeit

**Diagnosis (Diagnose):** Infektion, Allergie

**Medications (Medikamente):** Tablette, Spritze

**Measurements (Messungen):** Blutdruck

## Build & Run

### Building the Project

```bash
# Using the Gradle wrapper (recommended)
./gradlew build

# On Windows
gradlew.bat build
```

### Running the Application

```bash
# Using Gradle wrapper
./gradlew bootRun

# After building, run the JAR directly
java -jar build/libs/swissmedpreter-0.1.0.jar
```

The application will start on `http://localhost:8080`

## Configuration

Edit `src/main/resources/application.properties` to customize:

- `server.port=8080` - Server port
- `logging.level.ch.zhaw.swissmedpreter=DEBUG` - Log level

## CORS Configuration

The application allows CORS requests from all origins (development-friendly). For production, update `CorsConfig.java` to restrict allowed origins.

## Dependencies

- Spring Boot 2.7.14
- Spring Web (REST support)
- Spring WebSocket
- Google Gson (JSON serialization)

## Testing

The WebSocket and REST endpoints can be tested using:

- REST: curl, Postman, or any HTTP client
- WebSocket: Browser console, WebSocket clients, or tools like wscat

Example WebSocket test with curl:
```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8080/ws/conversation
```

## Project Status

- Java 11 compatible (Spring Boot 2.7.x)
- WebSocket real-time translation simulation
- Medical lexicon with 15 terms
- 20 supported languages
- CORS enabled for development

## Future Enhancements

- Integration with real translation APIs (e.g., Google Translate, DeepL)
- Database persistence for conversation history
- Authentication and authorization
- User profiles and preferences
- Support for additional medical terminology
- Advanced pictogram image assets
