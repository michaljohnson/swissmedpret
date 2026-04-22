# SwissMedPreter Conversation Prototype

Single-page prototype for the SwissMedPreter "Conversation" flow.

## Stack
- Frontend: React + Tailwind CSS + lightweight shadcn-style components
- Backend: Spring Boot + REST + WebSocket (STOMP over SockJS)
- Data: mock offline lexicon JSON

## Features
- Real-time bilingual transcript area
- Translation mode with side-by-side original and translated text
- Start/Stop session controls
- Hands-free toggle
- 20-language selector
- Keyword-triggered medical pictogram panel
- Offline lexicon search fallback
- Simulated on-prem connectivity copy and under-2-second latency

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

Open in browser: `http://localhost:5173`

## Run backend
```bash
cd backend
./mvnw spring-boot:run
```

Or with local Maven:
```bash
mvn spring-boot:run
```

## Notes
- `/api/simulate` simulates translation/transcription responses.
- `/ws` is the WebSocket endpoint.
- `/topic/conversation` broadcasts conversation events.
- `shared/medical-lexicon.json` contains the mock pictogram mapping.
- Backend root `/` on port 8080 does not serve the React UI in dev mode.
