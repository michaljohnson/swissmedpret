# SwissMedPreter Backend - Testing Guide

This guide provides comprehensive instructions for testing all endpoints and features of the SwissMedPreter backend application.

## Prerequisites

- Java 11 or higher installed
- cURL or Postman for REST API testing (optional)
- wscat for WebSocket testing (optional): `npm install -g wscat`
- Application running on http://localhost:8080

## Starting the Application

### Option 1: Using Gradle Wrapper

```bash
cd /sessions/amazing-vibrant-euler/mnt/ase2_project/swissmedpreter-backend
./gradlew bootRun
```

### Option 2: Build then Run JAR

```bash
cd /sessions/amazing-vibrant-euler/mnt/ase2_project/swissmedpreter-backend
./gradlew build
java -jar build/libs/swissmedpreter-0.1.0.jar
```

Expected output should show:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| ._ \_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.7.14)

2026-04-15 14:30:00.000  INFO  .... SwissMedPreterApplication : Starting SwissMedPreterApplication
...
2026-04-15 14:30:05.000  INFO  .... BootstrapLogger : Application started in 5.xxx seconds
```

## REST API Testing

### Test 1: Get Languages

**Command:**
```bash
curl -X GET "http://localhost:8080/api/languages"
```

**Expected Response (200 OK):**
- Array of 20 language objects
- Each with "code" (e.g., "de", "en") and "name" (e.g., "German", "English")

**Verify:**
- Status code: 200
- Response contains all 20 languages
- Sample languages: German, English, French, Arabic, Chinese, Japanese, etc.

---

### Test 2: Search for Medical Term (German)

**Command:**
```bash
curl -X GET "http://localhost:8080/api/lexicon/search?term=Handgelenk"
```

**Expected Response (200 OK):**
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

**Verify:**
- Status code: 200
- Returns exactly 1 result
- German term is "Handgelenk"
- English translation is "Wrist"
- Category is "Körperteile"
- Pictogram URL is present

---

### Test 3: Search for Medical Term (English)

**Command:**
```bash
curl -X GET "http://localhost:8080/api/lexicon/search?term=heart"
```

**Expected Response (200 OK):**
```json
[
  {
    "german": "Herz",
    "english": "Heart",
    "pictogramUrl": "/pictograms/heart.svg",
    "category": "Körperteile"
  }
]
```

**Verify:**
- Returns result for English search term "heart"
- Correctly maps to German "Herz"
- Category is "Körperteile"

---

### Test 4: Search for Multiple Matches

**Command:**
```bash
curl -X GET "http://localhost:8080/api/lexicon/search?term=sch"
```

**Expected Response (200 OK):**
```json
[
  {
    "german": "Schmerzen",
    "english": "Pain",
    "pictogramUrl": "/pictograms/pain.svg",
    "category": "Symptome"
  }
]
```

**Verify:**
- Partial matching works
- Case-insensitive search
- Returns matching terms

---

### Test 5: Search for Non-Existent Term

**Command:**
```bash
curl -X GET "http://localhost:8080/api/lexicon/search?term=nonexistent"
```

**Expected Response (200 OK):**
```json
[]
```

**Verify:**
- Returns empty array
- No error, graceful handling
- Status code: 200

---

### Test 6: Start Conversation Session

**Command:**
```bash
curl -X POST "http://localhost:8080/api/conversation/start"
```

**Expected Response (200 OK):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "started",
  "timestamp": 1681554600000
}
```

**Verify:**
- Status code: 200
- Response contains valid sessionId (UUID format)
- Status is "started"
- Timestamp is present (milliseconds since epoch)

---

### Test 7: Stop Conversation Session

**Command:**
```bash
curl -X POST "http://localhost:8080/api/conversation/stop"
```

**Expected Response (200 OK):**
```json
{
  "status": "stopped",
  "timestamp": 1681554605000
}
```

**Verify:**
- Status code: 200
- Status is "stopped"
- Timestamp is present

---

## WebSocket Testing

### Test 8: WebSocket Connection and Translation

#### Using JavaScript (Browser Console)

```javascript
// Open browser developer console (F12 or Ctrl+Shift+K)
// Paste this code:

const ws = new WebSocket('ws://localhost:8080/ws/conversation');

ws.onopen = function() {
  console.log('Connected to WebSocket');
  
  // Send translation request
  const request = {
    text: "Ich habe Schmerzen im Handgelenk",
    sourceLang: "de",
    targetLang: "ar"
  };
  
  console.log('Sending:', JSON.stringify(request));
  ws.send(JSON.stringify(request));
};

ws.onmessage = function(event) {
  const response = JSON.parse(event.data);
  console.log('Response received:', response);
  
  // Verify response
  console.assert(response.original !== undefined, 'original field missing');
  console.assert(response.translated !== undefined, 'translated field missing');
  console.assert(Array.isArray(response.detectedKeywords), 'detectedKeywords should be array');
  console.assert(response.timestamp !== undefined, 'timestamp missing');
  
  ws.close();
};

ws.onerror = function(error) {
  console.error('WebSocket error:', error);
};

ws.onclose = function() {
  console.log('WebSocket connection closed');
};
```

**Expected Output:**
```
Connected to WebSocket
Sending: {"text":"Ich habe Schmerzen im Handgelenk","sourceLang":"de","targetLang":"ar"}
Response received: {
  original: "Ich habe Schmerzen im Handgelenk",
  translated: "[TRANSLATED to ar]: Ich habe Schmerzen im Handgelenk",
  detectedKeywords: ["Handgelenk", "Schmerzen"],
  timestamp: "2026-04-15T14:30:00.123456"
}
WebSocket connection closed
```

**Verify:**
- WebSocket connection establishes
- Response arrives after 500-1500ms delay
- detectedKeywords contains both "Handgelenk" and "Schmerzen"
- Translation prefix includes target language
- Timestamp is ISO 8601 format

---

#### Using wscat

```bash
# Install wscat if not already installed
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8080/ws/conversation

# After connected, send JSON message
{"text":"Ich habe Fieber","sourceLang":"de","targetLang":"en"}

# Expected response (after 500-1500ms):
# {"original":"Ich habe Fieber","translated":"[TRANSLATED to en]: Ich habe Fieber","detectedKeywords":["Fieber"],"timestamp":"2026-04-15T14:30:05.123456"}

# Exit with Ctrl+C
```

---

#### Using Python

Create file `test_websocket.py`:

```python
import asyncio
import websockets
import json

async def test_translation():
    uri = "ws://localhost:8080/ws/conversation"
    
    async with websockets.connect(uri) as websocket:
        # Test 1: Send translation request
        request = {
            "text": "Ich habe Kopfschmerzen",
            "sourceLang": "de",
            "targetLang": "fr"
        }
        
        print(f"Sending: {json.dumps(request)}")
        await websocket.send(json.dumps(request))
        
        # Receive response
        response_text = await websocket.recv()
        response = json.loads(response_text)
        
        print(f"Response: {json.dumps(response, indent=2)}")
        
        # Verify response
        assert 'original' in response
        assert 'translated' in response
        assert 'detectedKeywords' in response
        assert 'timestamp' in response
        assert response['translated'].startswith('[TRANSLATED to fr]:')
        assert 'Kopf' in response['detectedKeywords']  # Should detect German terms
        
        print("All assertions passed!")

asyncio.run(test_translation())
```

Run with:
```bash
python3 test_websocket.py
```

---

### Test 9: Multiple WebSocket Messages

Send multiple translation requests in sequence:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/conversation');

ws.onopen = function() {
  const requests = [
    { text: "Ich habe Fieber", sourceLang: "de", targetLang: "en" },
    { text: "Mein Herz tut weh", sourceLang: "de", targetLang: "es" },
    { text: "Tablette für Kopfschmerzen", sourceLang: "de", targetLang: "it" }
  ];
  
  requests.forEach((req, index) => {
    setTimeout(() => {
      console.log(`Sending request ${index + 1}:`, req);
      ws.send(JSON.stringify(req));
    }, index * 3000);  // Send every 3 seconds
  });
};

ws.onmessage = function(event) {
  const response = JSON.parse(event.data);
  console.log('Response:', response);
};
```

**Verify:**
- All messages are processed
- Each response includes detected keywords
- Delays vary between 500-1500ms
- No connection errors occur

---

## Performance Testing

### Test 10: Lexicon Search Performance

```bash
# Test with different terms
for term in "Herz" "Kopf" "Lunge" "Fieber" "Allergie" "Tablette"; do
  echo "Testing search for: $term"
  curl -s "http://localhost:8080/api/lexicon/search?term=$term" | jq '.'
  echo ""
done
```

**Verify:**
- All searches complete quickly (< 100ms)
- Consistent response times
- No timeouts

---

### Test 11: Language Endpoint Performance

```bash
# Test languages endpoint multiple times
for i in {1..5}; do
  echo "Request $i:"
  time curl -s "http://localhost:8080/api/languages" > /dev/null
done
```

**Verify:**
- All requests complete < 50ms
- No timeout issues
- Consistent response times

---

## Stress Testing (Optional)

### Test 12: Rapid REST Requests

```bash
# Send 100 search requests
for i in {1..100}; do
  curl -s "http://localhost:8080/api/lexicon/search?term=herz" > /dev/null &
done
wait

echo "100 requests completed"
```

**Verify:**
- All requests succeed
- No 500 errors
- Application remains responsive

---

### Test 13: Multiple WebSocket Connections

```javascript
// Open 5 simultaneous WebSocket connections
for (let i = 0; i < 5; i++) {
  const ws = new WebSocket('ws://localhost:8080/ws/conversation');
  
  ws.onopen = function() {
    console.log(`Connection ${i} opened`);
    const request = {
      text: `Test message ${i}`,
      sourceLang: "de",
      targetLang: "en"
    };
    ws.send(JSON.stringify(request));
  };
  
  ws.onmessage = function(event) {
    console.log(`Connection ${i} received:`, event.data);
    ws.close();
  };
}
```

**Verify:**
- All connections establish
- Each connection receives independent response
- No interference between connections
- No memory leaks

---

## Health Check Script

Create `health_check.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"
FAILED=0

echo "=== SwissMedPreter Health Check ==="
echo ""

# Test 1: Languages endpoint
echo "1. Testing GET /api/languages"
RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/api/languages")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
  echo "   ✓ PASS (HTTP 200)"
else
  echo "   ✗ FAIL (HTTP $HTTP_CODE)"
  FAILED=$((FAILED+1))
fi

# Test 2: Lexicon search
echo "2. Testing GET /api/lexicon/search?term=Herz"
RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/api/lexicon/search?term=Herz")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
  echo "   ✓ PASS (HTTP 200)"
else
  echo "   ✗ FAIL (HTTP $HTTP_CODE)"
  FAILED=$((FAILED+1))
fi

# Test 3: Start conversation
echo "3. Testing POST /api/conversation/start"
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/conversation/start")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
  echo "   ✓ PASS (HTTP 200)"
else
  echo "   ✗ FAIL (HTTP $HTTP_CODE)"
  FAILED=$((FAILED+1))
fi

# Test 4: Stop conversation
echo "4. Testing POST /api/conversation/stop"
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/conversation/stop")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
  echo "   ✓ PASS (HTTP 200)"
else
  echo "   ✗ FAIL (HTTP $HTTP_CODE)"
  FAILED=$((FAILED+1))
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✓ All health checks passed"
  exit 0
else
  echo "✗ $FAILED health check(s) failed"
  exit 1
fi
```

Run with:
```bash
chmod +x health_check.sh
./health_check.sh
```

---

## Troubleshooting

### Issue: Connection Refused

**Cause:** Application not running

**Solution:**
```bash
./gradlew bootRun
```

### Issue: Port Already in Use

**Cause:** Another application using port 8080

**Solution:** Change port in `src/main/resources/application.properties`:
```properties
server.port=8081
```

### Issue: WebSocket Connection Fails

**Cause:** WebSocket endpoint not properly configured

**Solution:** Verify WebSocketConfig.java exists and application is running

### Issue: No Response from Translation

**Cause:** Application processing or network issue

**Solution:**
1. Check application logs for errors
2. Verify network connectivity
3. Ensure request JSON is valid

---

## Summary

All tests should pass if the application is properly configured and running. The test suite verifies:

- REST API functionality
- WebSocket connectivity
- Medical lexicon search
- Language support
- Conversation session management
- Performance characteristics
- Error handling

For more details, see API_DOCUMENTATION.md and README.md.
