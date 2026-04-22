# SwissMedPreter

**AI-gestützte medizinische Übersetzungs-App für Schweizer Spitäler**

SwissMedPreter ermöglicht die Echtzeitkommunikation zwischen medizinischem Fachpersonal und fremdsprachigen Patienten. Die App übersetzt medizinische Gespräche bidirektional und zeigt unterstützende Piktogramme für medizinische Begriffe an.

> Dieses Repository enthält den MVP (Minimum Viable Product), entwickelt als Fallstudie im ASE2-Modul an der ZHAW School of Engineering. Dasselbe MVP wurde mit zwei unterschiedlichen Ansätzen entwickelt, um **Single-Agent vs. Multi-Agent Systeme** in der Softwareentwicklung zu vergleichen.

---

## Branches

| Branch | Ansatz | AI-Tool |
|---|---|---|
| [`ChatGPT_Single-Agent`](../../tree/ChatGPT_Single-Agent) | Single-Agent (SAS) | ChatGPT Codex |
| [`Claude_Multi-Agent`](../../tree/Claude_Multi-Agent) | Multi-Agent (MAS) | Claude Cowork |

Beide Branches enthalten eine vollständig funktionsfähige Version des MVP. Der `main`-Branch dient als Übersicht und Einstiegspunkt.

---

## Gemeinsame Architektur

Beide Ansätze teilen dieselbe Grundarchitektur:

```
┌──────────────────────────────────────────────────┐
│                 SwissMedPreter                    │
├────────────────────┬─────────────────────────────┤
│  Patient Panel     │       Staff Panel            │
│  (Patientensprache)│       (Deutsch)              │
│        │           │           │                  │
│        ▼           │           ▼                  │
│   ┌──────────┐     │     ┌──────────┐             │
│   │ WebSocket│◄────┼────►│ WebSocket│             │
│   └────┬─────┘     │     └────┬─────┘             │
│        └─────┬─────┼──────────┘                   │
│              ▼     │                              │
│       ┌────────────┴──┐                           │
│       │  Spring Boot  │                           │
│       │  Backend      │                           │
│       └───────────────┘                           │
└──────────────────────────────────────────────────┘
```

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Spring Boot (Java 17)
- **Kommunikation:** WebSocket für Echtzeit-Nachrichten
- **Medizinisches Lexikon:** Schlüsselwort-Erkennung mit Piktogramm-Anzeige

---

## Unterschiede zwischen den Branches

| Aspekt | ChatGPT Single-Agent | Claude Multi-Agent |
|---|---|---|
| **React-Version** | React 18 (TypeScript) | React 19 (JavaScript) |
| **Build-Tool** | Maven | Gradle |
| **WebSocket** | STOMP (`@stomp/stompjs`) | Native WebSocket |
| **Übersetzung** | Simuliert (Offline-Prefixe) | DeepL API (echte Übersetzung) |
| **Sprachen** | 20 Sprachen | 5 Patientensprachen + Deutsch |
| **Spracheingabe** | — | Web Speech API (Chrome) |
| **Piktogramme** | Panel mit automatischer Erkennung | Klickbare Begriffe im Chat mit Dialog |
| **UI-Komponenten** | shadcn/ui (Radix Primitives) | Custom Components |
| **Java-Package** | `com.swissmedpreter` | `ch.zhaw.swissmedpreter` |

---

## Quickstart

### Voraussetzungen

- Java 17
- Node.js 18+
- Chrome (für Spracheingabe auf dem Claude-Branch)
- DeepL API Key — nur für den Claude-Branch ([deepl.com/pro-api](https://www.deepl.com/pro-api))

### Backend starten

```bash
cd backend

# ChatGPT-Branch (Maven):
mvn spring-boot:run

# Claude-Branch (Gradle):
export DEEPL_API_KEY=your-key-here
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

---

## ASE2-Projektkontext

Dieses MVP wurde als Fallstudie im ASE2-Modul entwickelt, um **Multi-Agent-Systeme (MAS) in grossen komplexen Softwaresystemen** zu untersuchen. Die zentrale Forschungsfrage:

> *Wann bietet ein Multiagentensystem tatsächlich einen Mehrwert?*

Der identische MVP-Scope wurde mit zwei Ansätzen umgesetzt:

- **Single-Agent (ChatGPT Codex):** Ein einzelner Agent bearbeitet alle Aufgaben sequenziell in einem Chat-Verlauf.
- **Multi-Agent (Claude Cowork):** Ein Orchestrator koordiniert spezialisierte Sub-Agenten für Frontend, Backend und Qualitätssicherung.

Die Ergebnisse sind im begleitenden LaTeX-Report dokumentiert und analysieren Koordination, Kosten/Nutzen, Debugging und Standards als zentrale Herausforderungen.

---

## Team

- Pascal Helfenberger
- Michal Johnson
- Leona Kryeziu
- Sivashan Sivakumaran

**Dozent:** Michael Wahler | **Modul:** ASE2, ZHAW School of Engineering, FS26
