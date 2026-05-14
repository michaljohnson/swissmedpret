# SwissMedPreter

> Quality care without language barriers.

A single-page prototype of the SwissMedPreter "Conversation" feature implementing
the architecture described in the SA Report (ASE 1, ZHAW School of Engineering).
This monorepo contains both the **React frontend** and the **Spring Boot backend**,
ready to run locally, in Docker, or deployed inside a hospital network.

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Hospital Network Perimeter                       │
│                                                                      │
│  ┌─────────────────┐  HTTPS / WSS   ┌────────────────────────────┐   │
│  │  React Client   │ ──────────────▶│  Spring Boot Application   │   │
│  │  Tablet/PC/Web  │ ◀──────────────│  REST + WebSocket          │   │
│  └─────────────────┘                └────────┬───────────────────┘   │
│                                              │ REST (mocked)         │
│                                     ┌────────▼─────────────┐         │
│                                     │ Local AI containers  │         │
│                                     │ (Docker / K8s)       │         │
│                                     └──────────────────────┘         │
│                                                                      │
│   No data leaves the perimeter. TLS 1.3 everywhere.                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Quick start

Pick whichever path fits your environment.

### Option A — Docker Compose (one command, no toolchain needed)

```bash
docker compose up --build
```

Then open <http://localhost:8081>. The frontend container proxies `/api` and `/ws`
to the backend container over the internal Docker network.

### Option B — Native dev setup

Prerequisites: **Node ≥ 20**, **Java 21** (Maven is downloaded automatically by `mvnw`).

In two terminals:

```bash
# Terminal 1 — backend
cd backend
./mvnw spring-boot:run            # mvnw.cmd on Windows
# → http://localhost:8080
```

```bash
# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Vite proxies `/api` and `/ws` to the backend during development, so the React app
just uses relative URLs.

---

## Repository layout

```
swissmedpreter/
├── README.md                      ← this file
├── docker-compose.yml             ← one-command full stack
├── .gitignore
│
├── frontend/                      ← Vite + React + Tailwind
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── nginx.conf                 ← prod proxy config (used in Docker)
│   ├── Dockerfile                 ← multi-stage: Node build → Nginx serve
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                ← the Conversation UI (single file)
│       └── index.css
│
└── backend/                       ← Spring Boot 3 + Java 21
    ├── pom.xml
    ├── mvnw / mvnw.cmd            ← Maven wrapper (no Maven install needed)
    ├── .mvn/wrapper/maven-wrapper.properties
    ├── Dockerfile                 ← multi-stage: Maven build → JRE runtime
    └── src/main/
        ├── java/com/swissmedpreter/
        │   ├── SwissMedPreterApplication.java
        │   ├── config/
        │   │   ├── WebSocketConfig.java
        │   │   └── WebConfig.java       (CORS, dev only)
        │   ├── controller/
        │   │   ├── ConversationController.java       (REST)
        │   │   ├── ConversationSocketHandler.java    (WebSocket)
        │   │   └── LexiconController.java
        │   ├── service/
        │   │   ├── TranslationService.java   (mocks the on-prem LLM)
        │   │   └── LexiconService.java
        │   └── model/
        │       └── Domain.java
        └── resources/
            ├── application.properties
            └── lexicon.json               (medical-image lexicon)
```

---

## API surface

| Method | Path                          | Purpose                                |
|--------|-------------------------------|----------------------------------------|
| GET    | `/api/lexicon`                | List all lexicon entries (or `?q=…`)   |
| GET    | `/api/lexicon/{id}`           | Single entry                            |
| GET    | `/api/engine`                 | Active translation engine + capabilities |
| POST   | `/api/conversation/translate` | One-shot translation request           |
| WS     | `/ws/conversation`            | Real-time turn-taking + translation    |

WebSocket protocol — JSON frames keyed by `type`:

```jsonc
// Client → Server
{ "type":"join",  "caseNumber":"CASE-2025-1207-A" }
{ "type":"speak", "speaker":"STAFF",
  "text":"Haben Sie Schmerzen am Handgelenk?",
  "sourceLang":"de", "targetLang":"ar" }

// Server → Client (broadcast to every session in the same case)
{ "type":"transcript",  "messageId":"…", "speaker":"STAFF", "text":"…",
  "sourceLang":"de", "targetLang":"ar", "issuedAt":"…" }
{ "type":"translation", "messageId":"…", "translation":"…",
  "detectedTerms":["wrist","pain"], "latencyMs":920, "issuedAt":"…" }
```

---

## Feature → SA Report requirement mapping

| Feature in the prototype                        | Requirement(s)       |
|-------------------------------------------------|----------------------|
| Bilingual chat with side-by-side translation    | R02, R04, R10        |
| < 2 s simulated translation latency             | R18 / Q2             |
| Auto-detection of medical keywords              | R09, R13             |
| Pictogram side panel + recent history           | R07, R13, Q1         |
| Offline lexicon search                          | R07, R22 / Q7        |
| Language picker (20 languages)                  | R04                  |
| Hands-free toggle                               | R12 / Q2             |
| Emergency-mode banner                           | R12, R06             |
| FADP/GDPR + on-prem indicators in header        | R19, R27 / Q3        |
| Audit hook to KIS (case number in header)       | R01, R03 / Q5        |

---

## Translation engine

`TranslationService` cascades through four layers per utterance:

1. **LibreTranslate** — real on-prem free translation engine. Enabled when
   `swissmedpreter.libretranslate.url` (or env var
   `SWISSMEDPRETER_LIBRETRANSLATE_URL`) is set to a reachable instance, e.g.
   `http://libretranslate:5000` inside docker compose, or
   `http://localhost:5050` if you start the container yourself.
2. **Phrasebook** — exact-match lookup against `phrasebook.json` (20 common
   medical phrases in 11 languages).
3. **Lexicon substitution** — replaces known medical terms in-place via
   `lexicon.json` (handy for German compounds like "Bauchschmerzen").
4. **Passthrough** — returns the original text untouched if all else fails.

Each translation response includes the `engine` field so the frontend can
show which layer actually handled it.

### Running with LibreTranslate via Docker Compose

```bash
docker compose up --build
```

On first run the LibreTranslate container downloads the language packs
selected via `LT_LOAD_ONLY` in `docker-compose.yml` (≈1–2 GB total, kept in
the `lt-models` named volume). Subsequent starts are fast.

### Running LibreTranslate alongside a local dev backend

```bash
docker run -d --rm --name libretranslate -p 5050:5000 \
    -e LT_LOAD_ONLY="de,en,fr,it,es,ar,tr" \
    -e LT_DISABLE_WEB_UI=true \
    libretranslate/libretranslate:latest

# then in backend/
SWISSMEDPRETER_LIBRETRANSLATE_URL=http://localhost:5050 ./mvnw spring-boot:run
```

Without any URL set, the backend silently falls back to the bundled
phrasebook + lexicon mock — the UI still shows side-by-side translations
for all phrasebook entries.

---

## License

Coursework prototype, ZHAW School of Engineering.
