# SwissMedPreter
<img width="817" height="859" alt="f1b1f4311090891eb818dcbf93526e72eaafe308ccabc95718585c3cc82c88d5" src="https://github.com/user-attachments/assets/62c2220b-06e6-4a7f-8ecd-3e8cc6c680dc" />



**AI-gestützte medizinische Übersetzungs-App für Schweizer Spitäler**

SwissMedPreter ermöglicht die Echtzeitkommunikation zwischen medizinischem Fachpersonal und fremdsprachigen Patienten. Die App übersetzt medizinische Gespräche und zeigt unterstützende Piktogramme an.

> Dieses Repository enthält den MVP (Minimum Viable Product), entwickelt im Rahmen des ASE2-Moduls an der ZHAW.

---

## Features

- **Echtzeit-Übersetzung** — Bidirektionale Übersetzung zwischen Deutsch und 5 Patientensprachen (Spanisch, Französisch, Türkisch, Englisch, Italienisch)
- **WebSocket-Kommunikation** — Live-Verbindung zwischen Frontend und Backend
- **Medizinische Piktogramme** — Visuelle Unterstützung bei erkannten medizinischen Begriffen
- **Schlüsselwort-Erkennung** — Automatische Erkennung von 15 medizinischen Fachbegriffen aus dem Lexikon
- **Sprachauswahl** — Dropdown zur Auswahl der Patientensprache

## Tech Stack

| Komponente | Technologie |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Spring Boot 3.4.1 (Java 17) |
| Kommunikation | WebSocket + REST API |
| Build | Gradle 8.9 / npm |

## Projektstruktur

```
swissmedpreter/
├── frontend/     # React-Frontend
│   └── src/components/
│       ├── ConversationPage.jsx  # Hauptseite mit WebSocket-Client
│       ├── TranscriptPanel.jsx   # Bilingualer Chat
│       ├── PictogramPanel.jsx    # Medizinische Piktogramme
│       ├── ControlBar.jsx        # Steuerungsleiste
│       ├── LanguageSelector.jsx  # Sprachauswahl
│       ├── Header.jsx            # App-Header
│       └── MedicalPictograms.jsx # SVG-Piktogramme
├── backend/      # Spring Boot Backend
│   └── src/main/java/ch/zhaw/swissmedpreter/
│       ├── config/               # WebSocket & CORS Config
│       ├── controller/           # REST-Controller
│       ├── handler/              # WebSocket-Handler
│       ├── model/                # Datenmodelle
│       └── service/              # Übersetzungs- & Lexikon-Service
└── assets/                      # Architektur-Diagramme
```

## Quickstart

### Voraussetzungen

- Java 17 (`brew install openjdk@17`)
- Node.js 18+
- Gradle 8.9+

### Backend starten

```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@17  # macOS
./gradlew bootRun
```

Backend läuft auf `http://localhost:8080`

### Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft auf `http://localhost:5173`

## Kontext: ASE2-Projekt

Dieses MVP wurde als Fallstudie im ASE2-Modul entwickelt. Das Thema des Projekts ist **Multi-Agent-Systeme (MAS) in grossen komplexen Softwaresystemen**. Der MVP wurde mithilfe von Claude Cowork als Multi-Agent-System erstellt — mit parallelen Subagenten für Frontend, Backend und Qualitätssicherung.

## Team
- Pascal Helfenberger
- Michal Johnson
- Leona Kryeziu
- Sivashan Sivakumaran

**Dozent:** Michael Wahler | **Modul:** ASE2, ZHAW School of Engineering, FS26
