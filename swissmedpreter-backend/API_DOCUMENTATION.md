# SwissMedPreter API Documentation

## Base URL
```
http://localhost:8080
```

## REST API Endpoints

### 1. Lexicon Search

**Endpoint:** `GET /api/lexicon/search`

Search for medical terms in the lexicon database.

**Query Parameters:**
- `term` (required, string): The search term (German or English)

**Response:** Array of matching lexicon entries

**Example Request:**
```bash
curl "http://localhost:8080/api/lexicon/search?term=Handgelenk"
```

**Example Response (200 OK):**
```json
[
  {
    "german": "Handgelenk",
    "english": "Wrist",
    "pictogramUrl": "/pictograms/wrist.svg",
    "category": "Körperteile"
  }
]
```

**Example with English Term:**
```bash
curl "http://localhost:8080/api/lexicon/search?term=heart"
```

---

### 2. Get Supported Languages

**Endpoint:** `GET /api/languages`

Retrieve the list of all supported languages for translation.

**Response:** Array of language objects with code and name

**Example Request:**
```bash
curl "http://localhost:8080/api/languages"
```

**Example Response (200 OK):**
```json
[
  {
    "code": "de",
    "name": "German"
  },
  {
    "code": "en",
    "name": "English"
  },
  {
    "code": "fr",
    "name": "French"
  },
  {
    "code": "it",
    "name": "Italian"
  },
  {
    "code": "es",
    "name": "Spanish"
  },
  {
    "code": "pt",
    "name": "Portuguese"
  },
  {
    "code": "nl",
    "name": "Dutch"
  },
  {
    "code": "pl",
    "name": "Polish"
  },
  {
    "code": "ru",
    "name": "Russian"
  },
  {
    "code": "ar",
    "name": "Arabic"
  },
  {
    "code": "zh",
    "name": "Chinese"
  },
  {
    "code": "ja",
    "name": "Japanese"
  },
  {
    "code": "ko",
    "name": "Korean"
  },
  {
    "code": "th",
    "name": "Thai"
  },
  {
    "code": "tr",
    "name": "Turkish"
  },
  {
    "code": "vi",
    "name": "Vietnamese"
  },
  {
    "code": "id",
    "name": "Indonesian"
  },
  {
    "code": "hi",
    "name": "Hindi"
  },
  {
    "code": "bn",
    "name": "Bengali"
  },
  {
    "code": "pa",
    "name": "Punjabi"
  }
]
```

---

### 3. Start Conversation

**Endpoint:** `POST /api/conversation/start`

Initiate a new conversation session for real-time translation.

**Request Body:** (empty or optional JSON object)

**Response:** Object with sessionId and status

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/conversation/start"
```

**Example Response (200 OK):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "started",
  "timestamp": 1681554600000
}
```

---

### 4. Stop Conversation

**Endpoint:** `POST /api/conversation/stop`

Terminate the current conversation session.

**Request Body:** (empty or optional JSON object)

**Response:** Object with status and timestamp

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/conversation/stop"
```

**Example Response (200 OK):**
```json
{
  "status": "stopped",
  "timestamp": 1681554605000
}
```

---

## WebSocket API

### Real-Time Translation via WebSocket

**Endpoint:** `ws://localhost:8080/ws/conversation`

Establish a WebSocket connection for real-time message translation with simulated delays.

### Message Protocol

**Client Request Format:**
```json
{
  "text": "Ich habe Schmerzen im Handgelenk",
  "sourceLang": "de",
  "targetLang": "ar"
}
```

**Server Response Format:**
```json
{
  "original": "Ich habe Schmerzen im Handgelenk",
  "translated": "[TRANSLATED to ar]: Ich habe Schmerzen im Handgelenk",
  "detectedKeywords": ["Handgelenk", "Schmerzen"],
  "timestamp": "2026-04-15T14:30:00.123456"
}
```

### WebSocket Behavior

1. **Connection**: Client connects to `/ws/conversation`
2. **Request**: Client sends JSON message with text and language codes
3. **Processing**: Server processes the message with:
   - Random delay simulation: 500-1500ms
   - Medical keyword detection from lexicon
   - Translation response generation
4. **Response**: Server sends translation response back to client
5. **Termination**: Client can close the connection at any time

### Example WebSocket Connection (JavaScript)

```javascript
// Establish WebSocket connection
const ws = new WebSocket('ws://localhost:8080/ws/conversation');

// Connection opened
ws.onopen = function() {
  console.log('Connected to translation server');
  
  // Send a translation request
  const request = {
    text: "Ich habe Schmerzen im Handgelenk",
    sourceLang: "de",
    targetLang: "ar"
  };
  ws.send(JSON.stringify(request));
};

// Receive translation response
ws.onmessage = function(event) {
  const response = JSON.parse(event.data);
  console.log('Translation response:', response);
  // Output:
  // {
  //   "original": "Ich habe Schmerzen im Handgelenk",
  //   "translated": "[TRANSLATED to ar]: Ich habe Schmerzen im Handgelenk",
  //   "detectedKeywords": ["Handgelenk", "Schmerzen"],
  //   "timestamp": "2026-04-15T14:30:00.123456"
  // }
};

// Handle errors
ws.onerror = function(error) {
  console.error('WebSocket error:', error);
};

// Connection closed
ws.onclose = function() {
  console.log('Disconnected from translation server');
};
```

### Example WebSocket Connection (Python)

```python
import asyncio
import websockets
import json

async def main():
    uri = "ws://localhost:8080/ws/conversation"
    
    async with websockets.connect(uri) as websocket:
        # Send translation request
        request = {
            "text": "Ich habe Schmerzen im Handgelenk",
            "sourceLang": "de",
            "targetLang": "ar"
        }
        await websocket.send(json.dumps(request))
        
        # Receive translation response
        response = await websocket.recv()
        result = json.loads(response)
        print("Translation response:", result)

asyncio.run(main())
```

---

## Medical Lexicon Terms

The following medical terms are available in the lexicon:

### Body Parts (Körperteile)
- Handgelenk (Wrist)
- Kopf (Head)
- Herz (Heart)
- Lunge (Lung)
- Magen (Stomach)
- Knie (Knee)
- Rücken (Back)

### Symptoms (Symptome)
- Fieber (Fever)
- Schmerzen (Pain)
- Übelkeit (Nausea)

### Diagnosis (Diagnose)
- Infektion (Infection)
- Allergie (Allergy)

### Medications (Medikamente)
- Tablette (Tablet)
- Spritze (Injection)

### Measurements (Messungen)
- Blutdruck (Blood Pressure)

---

## CORS Policy

The API allows requests from all origins for development purposes:
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: All
- Credentials: Not allowed

For production, update the CORS policy in `src/main/java/ch/zhaw/swissmedpreter/config/CorsConfig.java`.

---

## Error Handling

### WebSocket Errors

The server may send error responses in JSON format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Scenarios

1. **Invalid JSON Format**: Malformed JSON in request
2. **Missing Parameters**: Required fields missing from request
3. **Invalid Language Code**: Unsupported language code provided

---

## Testing with curl and wscat

### REST Endpoint Testing

```bash
# Search for "Herz" (Heart)
curl "http://localhost:8080/api/lexicon/search?term=Herz"

# Get all languages
curl "http://localhost:8080/api/languages"

# Start conversation
curl -X POST "http://localhost:8080/api/conversation/start"

# Stop conversation
curl -X POST "http://localhost:8080/api/conversation/stop"
```

### WebSocket Testing with wscat

```bash
# Install wscat globally
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8080/ws/conversation

# Send a translation request (after connecting)
{"text":"Ich habe Fieber","sourceLang":"de","targetLang":"en"}
```

---

## Performance Notes

- WebSocket message processing: 500-1500ms (simulated delay)
- REST endpoints: < 100ms response time
- Lexicon search: O(n) linear scan through 15 terms
- No database persistence (in-memory lexicon)

---

## Future Enhancements

- Real translation engine integration
- Conversation history persistence
- User authentication
- Advanced medical terminology database
- Multilingual UI support
- Analytics and logging
