# SwissMedPreter

**AI-powered medical translation app for Swiss hospitals**

SwissMedPreter enables real-time communication between medical staff and foreign-language patients. The app translates conversations bidirectionally and displays supportive pictograms for medical body-part terminology.

> This repository contains the MVP (Minimum Viable Product), developed as a case study for the ASE2 module at ZHAW School of Engineering.


## Features

- **Split-Screen Dual Chat** — Separate chat panels for patient and staff, each showing the conversation in their own language
- **Real-Time Translation** — Bidirectional translation between German and 5 patient languages via DeepL API
- **Voice Input** — Hands-free speech-to-text via Web Speech API, supporting all 5 patient languages + German
- **Medical Pictogram Lexicon** — Clickable body-part terms in chat messages open an illustrated dialog with multilingual translations (10 body parts, 7 languages)
- **WebSocket Communication** — Live connection between frontend and backend for instant message delivery
- **Keyword Detection** — Automatic detection of medical terms across all supported languages

## Supported Languages

| Patient Languages | Staff Language |
|---|---|
| English, Spanish, French, Italian, Japanese | German (Deutsch) |

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Spring Boot 3.4.1 (Java 17) |
| Translation | DeepL API Free |
| Voice Input | Web Speech API (Chrome) |
| Communication | WebSocket + REST API |
| Build | Gradle 8.9 / npm |

## Project Structure

```
swissmedpreter/
├── frontend/                        # React Frontend
│   ├── public/
│   │   ├── icon-patient.svg         # Patient avatar icon
│   │   └── icon-staff.svg           # Staff avatar icon
│   └── src/
│       ├── components/
│       │   ├── ConversationPage.jsx  # Main page — dual chat layout, WebSocket client
│       │   ├── ChatPanel.jsx         # Reusable chat panel with voice input
│       │   ├── MedicalTermDialog.jsx # Pictogram popup dialog (10 body parts, 7 langs)
│       │   ├── LanguageSelector.jsx  # Patient language dropdown (5 languages)
│       │   ├── PictogramPanel.jsx    # Sidebar pictogram display
│       │   └── MedicalPictograms.jsx # SVG pictogram definitions
│       └── lib/
│           └── utils.js             # Shadcn cn() utility
├── backend/                         # Spring Boot Backend
│   └── src/main/java/ch/zhaw/swissmedpreter/
│       ├── config/                  # WebSocket & CORS configuration
│       ├── controller/              # REST controllers
│       ├── handler/                 # WebSocket handler
│       ├── model/                   # Data models
│       └── service/                 # TranslationService (DeepL) & LexiconService
├── .env.example                     # Environment variable template
└── .gitignore
```

## Quickstart

### Prerequisites

- Java 17
- Node.js 18+
- DeepL API Key (free tier: [deepl.com/pro-api](https://www.deepl.com/pro-api))
- Chrome browser (required for voice input)

### 1. Set up environment

```bash
cp .env.example .env
# Edit .env and add your DeepL API key
```

### 2. Start Backend

```bash
source .env
cd backend
./gradlew bootRun
```

Backend runs on `http://localhost:8080`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Architecture

The app follows a split-screen dual-chat architecture:

```
┌─────────────────────────────────────────────────────┐
│                   SwissMedPreter                     │
├──────────────────────┬──────────────────────────────┤
│   Patient Panel      │        Staff Panel           │
│   (Patient Language) │        (German)              │
│                      │                              │
│  Patient types in    │   Staff types in German      │
│  their language      │                              │
│         │            │            │                  │
│         ▼            │            ▼                  │
│   ┌──────────┐       │     ┌──────────┐             │
│   │ WebSocket│◄──────┼────►│ WebSocket│             │
│   └────┬─────┘       │     └────┬─────┘             │
│        │             │          │                    │
│        └──────┬──────┼──────────┘                    │
│               ▼      │                               │
│        ┌─────────────┴──┐                            │
│        │  Spring Boot   │                            │
│        │  + DeepL API   │                            │
│        └────────────────┘                            │
└─────────────────────────────────────────────────────┘
```

1. Patient types/speaks in their language → message appears on patient panel
2. Backend translates to German via DeepL → translated message appears on staff panel
3. Staff replies in German → message appears on staff panel
4. Backend translates to patient language → translated message appears on patient panel

Medical keywords are detected in both directions and highlighted as clickable terms that open an illustrated pictogram dialog.

## ASE2 Project Context

This MVP was developed as a case study in the ASE2 module, exploring **Multi-Agent Systems (MAS) in large complex software systems**. The project compares two approaches:

- **Single-Agent (ChatGPT Codex)** — One agent handles the entire development
- **Multi-Agent (Claude Cowork)** — Specialized sub-agents for frontend, backend, and quality assurance, coordinated by a central orchestrator

The findings are documented in the accompanying LaTeX report, analyzing coordination, cost/benefit, debugging, and traceability trade-offs between SAS and MAS approaches.

## Team

- Pascal Helfenberger
- Michal Johnson
- Leona Kryeziu
- Sivashan Sivakumaran

**Lecturer:** Michael Wahler | **Module:** ASE2, ZHAW School of Engineering, FS26
