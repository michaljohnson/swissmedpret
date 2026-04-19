# SwissMedPreter Backend - START HERE

Welcome to the SwissMedPreter medical translation backend project. This document guides you through the project setup, structure, and testing.

## Quick Start (60 seconds)

```bash
# 1. Navigate to project directory
cd /sessions/amazing-vibrant-euler/mnt/ase2_project/swissmedpreter-backend

# 2. Build the project
./gradlew build

# 3. Run the application
./gradlew bootRun

# 4. In another terminal, test the API
curl http://localhost:8080/api/languages
```

**Expected Output:** JSON array with 20 language objects

## Project Overview

SwissMedPreter is a Spring Boot 2.7.x REST and WebSocket API for medical translation. It provides:

- **REST Endpoints** for lexicon search and language support
- **WebSocket** endpoint for real-time translation simulation
- **Medical Lexicon** with 15 German medical terms
- **CORS Support** for cross-origin requests
- **Java 11** compatible code

## What's Inside

### Core Application Files

| File | Purpose |
|------|---------|
| `build.gradle` | Gradle build configuration with Spring Boot 2.7.14 |
| `src/main/java/ch/zhaw/swissmedpreter/` | Main application package |
| `src/main/resources/lexicon.json` | Medical terminology database (15 terms) |
| `src/main/resources/application.properties` | Spring Boot configuration |

### Key Components

1. **Controllers** - REST API endpoints
   - `ConversationController` - Session management
   - `LexiconController` - Medical term search
   - `LanguageController` - Language list

2. **Services** - Business logic
   - `LexiconService` - Lexicon database operations
   - `TranslationService` - Translation processing

3. **WebSocket** - Real-time messaging
   - `TranslationWebSocketHandler` - WebSocket message handling
   - Endpoint: `ws://localhost:8080/ws/conversation`

4. **Configuration** - Application setup
   - `CorsConfig` - CORS settings
   - `WebSocketConfig` - WebSocket endpoint registration

## API Endpoints

### REST Endpoints

1. **Search Medical Terms**
   ```bash
   GET /api/lexicon/search?term=Handgelenk
   ```
   Returns matching medical terms with English translation and pictogram URLs.

2. **Get Languages**
   ```bash
   GET /api/languages
   ```
   Returns 20 supported language codes and names.

3. **Start Conversation**
   ```bash
   POST /api/conversation/start
   ```
   Initiates a conversation session, returns unique sessionId.

4. **Stop Conversation**
   ```bash
   POST /api/conversation/stop
   ```
   Terminates a conversation session.

### WebSocket Endpoint

**URL:** `ws://localhost:8080/ws/conversation`

**Request Example:**
```json
{
  "text": "Ich habe Schmerzen im Handgelenk",
  "sourceLang": "de",
  "targetLang": "ar"
}
```

**Response Example:**
```json
{
  "original": "Ich habe Schmerzen im Handgelenk",
  "translated": "[TRANSLATED to ar]: Ich habe Schmerzen im Handgelenk",
  "detectedKeywords": ["Handgelenk", "Schmerzen"],
  "timestamp": "2026-04-15T14:30:00.123456"
}
```

## Medical Lexicon Terms

The lexicon contains 15 German medical terms:

**Body Parts:** Handgelenk, Kopf, Herz, Lunge, Magen, Knie, Rücken
**Symptoms:** Fieber, Schmerzen, Übelkeit
**Diagnosis:** Infektion, Allergie
**Medications:** Tablette, Spritze
**Measurements:** Blutdruck

## Documentation Files

| File | Content |
|------|---------|
| `README.md` | Project overview and setup guide |
| `API_DOCUMENTATION.md` | Complete API reference with examples |
| `TEST_GUIDE.md` | Testing instructions and examples |
| `PROJECT_SUMMARY.txt` | Architecture and technical details |
| `DELIVERABLES.txt` | Complete deliverables checklist |
| `START_HERE.md` | This file |

## Testing

### Quick Test

```bash
# Test REST API
curl http://localhost:8080/api/languages

# Test WebSocket with JavaScript (browser console)
const ws = new WebSocket('ws://localhost:8080/ws/conversation');
ws.onopen = () => ws.send('{"text":"Ich habe Fieber","sourceLang":"de","targetLang":"en"}');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Comprehensive Testing

For detailed testing instructions with 13 test cases, see `TEST_GUIDE.md`

## Building the Project

### Prerequisites
- Java 11 or higher
- Gradle wrapper (included)

### Build Commands

```bash
# Build the project (creates JAR)
./gradlew build

# Run in development mode
./gradlew bootRun

# Clean build artifacts
./gradlew clean

# Run tests
./gradlew test
```

## Project Structure

```
swissmedpreter-backend/
├── build.gradle                          # Build configuration
├── settings.gradle                       # Gradle settings
├── gradlew                               # Gradle wrapper (Unix)
├── gradle/wrapper/gradle-wrapper.properties
├── src/main/java/ch/zhaw/swissmedpreter/
│   ├── SwissMedPreterApplication.java    # Main application
│   ├── config/
│   │   ├── CorsConfig.java               # CORS configuration
│   │   └── WebSocketConfig.java          # WebSocket setup
│   ├── controller/
│   │   ├── ConversationController.java   # Session endpoints
│   │   ├── LexiconController.java        # Search endpoints
│   │   └── LanguageController.java       # Language endpoints
│   ├── handler/
│   │   └── TranslationWebSocketHandler.java
│   ├── model/
│   │   ├── TranslationRequest.java
│   │   ├── TranslationResponse.java
│   │   └── LexiconEntry.java
│   └── service/
│       ├── LexiconService.java
│       └── TranslationService.java
└── src/main/resources/
    ├── application.properties             # Spring Boot config
    └── lexicon.json                       # Medical lexicon
```

## Technical Stack

- **Framework:** Spring Boot 2.7.14
- **Language:** Java 11
- **Build Tool:** Gradle 7.6.1
- **API:** REST + WebSocket
- **JSON:** Gson 2.10.1

## Configuration

### Server Port

Edit `src/main/resources/application.properties`:

```properties
server.port=8080
```

### Logging Level

Edit `src/main/resources/application.properties`:

```properties
logging.level.ch.zhaw.swissmedpreter=DEBUG
```

## Common Tasks

### Search for a Medical Term

```bash
curl "http://localhost:8080/api/lexicon/search?term=Herz"
```

### Get All Supported Languages

```bash
curl "http://localhost:8080/api/languages"
```

### Start a Conversation Session

```bash
curl -X POST "http://localhost:8080/api/conversation/start"
```

### Send Translation via WebSocket

Use a WebSocket client or browser console to send:

```json
{
  "text": "Ich bin krank",
  "sourceLang": "de",
  "targetLang": "en"
}
```

## Troubleshooting

### Port Already in Use
Change the port in `application.properties`:
```properties
server.port=8081
```

### Build Fails
Ensure Java 11+ is installed:
```bash
java -version
```

### WebSocket Connection Fails
1. Ensure application is running
2. Check WebSocket URL: `ws://localhost:8080/ws/conversation`
3. Verify network connectivity

## Next Steps

1. **Explore the Code**
   - Start with `SwissMedPreterApplication.java`
   - Review controllers in `controller/` directory
   - Check service logic in `service/` directory

2. **Test the API**
   - Follow examples in `API_DOCUMENTATION.md`
   - Run tests from `TEST_GUIDE.md`

3. **Understand the Architecture**
   - Read `PROJECT_SUMMARY.txt` for technical overview
   - Review `README.md` for feature details

4. **Customize**
   - Add new medical terms to `lexicon.json`
   - Integrate real translation APIs
   - Extend REST endpoints
   - Add database persistence

## Requirements Met

✓ Java 11 compatible Spring Boot 2.7.x
✓ Gradle build system with wrapper
✓ WebSocket endpoint at /ws/conversation
✓ REST endpoints for lexicon search and language support
✓ Medical lexicon with 15 German-English terms
✓ Pictogram URL mappings for each term
✓ CORS enabled for all origins
✓ Server running on port 8080
✓ Project compiles successfully
✓ Complete documentation provided

## Support

For more information, see:
- `API_DOCUMENTATION.md` - API reference
- `TEST_GUIDE.md` - Testing guide
- `README.md` - Project documentation

---

**Version:** 0.1.0
**Build Date:** April 15, 2026
**Status:** Ready for Deployment
