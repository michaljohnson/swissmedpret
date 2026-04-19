# SwissMedPreter Conversation Prototype

This prototype includes:
- `frontend/`: React + Tailwind + shadcn-style UI components for a single-page clinical conversation console.
- `backend/`: Spring Boot REST + WebSocket server that simulates local transcription/translation behavior.
- `backend/src/main/resources/lexicon.json`: Offline medical lexicon with SVG pictograms.

## Run the backend
```bash
cd backend
mvn spring-boot:run
```

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:8080`

## Implemented features
- Split-view bilingual transcript with simulated sub-2-second latency.
- Start/stop session controls.
- 20-language selectors.
- Hands-free toggle.
- Automatic medical pictogram panel driven by transcript keyword detection.
- Manual offline lexicon search.
- Local-only hospital gateway messaging language in the UI.
