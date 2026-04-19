# Claude Cowork Session-Analyse: SwissMedPreter MVP

## Übersicht

| Kennzahl                        | Wert                                  |
| ------------------------------- | ------------------------------------- |
| Gesamtdauer                     | ~2.5 Stunden                          |
| User-Prompts (gesamt)           | ~35                                   |
| Davon: Fehlermeldungen/Bugfixes | 12                                    |
| Davon: Feature-Anfragen         | 8                                     |
| Davon: Klärungsfragen          | 15                                    |
| Generierte Dateien              | 19 (7 Frontend, 12 Backend)           |
| Integrationsfehler              | 8                                     |
| Subagenten eingesetzt           | 3 Typen (Frontend, Backend, Explorer) |

---

## Phase 1 — Report-Überarbeitung (funktionierte gut)

**Prompts:** ~8
**Fehler:** 1 (LaTeX-Parsing)

Der Orchestrator überarbeitete die 3 Kapitel des ASE2-Reports direkt (ohne Subagenten). Das funktionierte effizient:

| Schritt | Prompt (User)                                   | Ergebnis                                           |
| ------- | ----------------------------------------------- | -------------------------------------------------- |
| 1       | "Help me rewrite chapter 3, it's too general"   | Alle 3 Kapitel neu geschrieben, fokussiert auf MAS |
| 2       | "Is this part of the task to name 2 use cases?" | Klärung — ja, gefordert lt. Aufgabenstellung     |
| 3       | "Swap SEAMLESS for Microsoft AutoGen"           | Use Case 2 ersetzt                                 |
| 4       | "Make margins smaller"                          | DIV=13 in KOMA-Script                              |
| 5       | "Make title gaps smaller"                       | RedeclareSectionCommand in preamble.tex            |
| 6       | "Don't start every chapter on new page"         | style=section für chapters                        |
| 7       | "What exactly did you change?"                  | User wollte Transparenz über Änderungen          |

**1 Fehler:** `\item [TODO:]` — LaTeX interpretierte `[TODO:]` als optionales Argument → Fix: `\item {[TODO:]}`

**Bewertung:** ✅ Sehr gut. Direkte Textarbeit ohne Subagenten war schnell und präzise.

---

## Phase 2 — MVP Code-Generierung (teilweise problematisch)

**Prompts:** ~5
**Subagenten:** 2 parallel (Frontend + Backend)

Der Orchestrator zerlegte die Aufgabe und startete zwei Subagenten parallel:

### Frontend-Subagent

* **Generiert:** 7 React-Komponenten, package.json, Vite-Config, Tailwind-Config
* **Qualität:** Funktional, UI sauber, WebSocket-Client korrekt implementiert
* **Problem:** `node_modules` für Linux gebaut (Sandbox) → auf macOS unbrauchbar

### Backend-Subagent

* **Generiert:** 12 Java-Klassen, build.gradle, lexicon.json, Gradle Wrapper
* **Qualität:** Grundstruktur korrekt, aber mehrere Integrationsfehler
* **Probleme:**
  * Gradle Wrapper .jar war ein 25-Byte-Platzhalter (nicht funktionsfähig)
  * Spring Boot 2.7 → 3.4.1 Upgrade nötig (vom User angefragt)
  * Dependency Injection falsch verdrahtet (`new` statt Spring-Injection)
  * JSON-Feldnamen nicht mit Frontend abgestimmt

### Explorer-Subagent

* Wurde später für Codebase-Analyse und Konfigurationsprüfung eingesetzt
* **Qualität:** Zuverlässig für Read-only Aufgaben

**Bewertung:** ⚠️ Gemischt. Code-Generierung war schnell, aber die Agenten arbeiteten isoliert — kein gemeinsamer API-Vertrag, keine gegenseitige Validierung.

---

## Phase 3 — Iteratives Debugging (aufwendig)

**Prompts:** ~12 (alle Fehlermeldungen vom User)
**Fehler gelöst:** 8

Jeder Fehler erforderte einen Human-in-the-Loop-Zyklus: User testet → meldet Fehler → Orchestrator diagnostiziert → Fix → User testet erneut.

### Fehler-Chronologie

| # | Fehler                                                    | Ursache                                                         | Erkennung                               | Fix-Aufwand                                                              |
| - | --------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| 1 | `node_modules`Plattform-Mismatch                        | Subagent baute in Linux-Sandbox, User auf macOS ARM64           | User meldet Fehler                      | 1 Prompt                                                                 |
| 2 | Gradle Wrapper .jar Platzhalter (25 Bytes)                | Subagent kann keine Binärdateien korrekt erstellen             | User meldet Fehler                      | 2 Prompts                                                                |
| 3 | Java 25 inkompatibel mit Gradle 7.6                       | Subagent nutzte veraltete Gradle-Version                        | User meldet Fehler                      | 2 Prompts (erst Gradle 8.9, dann Java 17)                                |
| 4 | `NoClassDefFoundError: Gson Strictness`                 | Gson 2.10.1 zu alt für Spring Boot 3.4.1                       | User meldet Fehler                      | 1 Prompt                                                                 |
| 5 | WebSocket JSON-Parse-Fehler                               | Fehler-Serialisierung mit String-Concatenation statt Gson       | User meldet Screenshot                  | 2 Prompts (Diagnose + Fix)                                               |
| 6 | Spring DI defekt —`NullPointerException`               | Handler nutzte `new TranslationService()`statt Injection      | Orchestrator erkennt bei Analyse von #5 | Zusammen mit #5 gefixt                                                   |
| 7 | Frontend/Backend Feldnamen-Mismatch                       | `targetText`vs `translated`,`originalText`vs `original` | Orchestrator erkennt bei Analyse von #5 | Zusammen mit #5 gefixt                                                   |
| 8 | Übersetzung immer gleiche Sprache +`Map.of()`>10 Limit | Mock-Translation ohne echte Logik + Java API-Limit              | User meldet                             | 3 Prompts (1. zu viele Sprachen, 2. Map.of Limit, 3. Arabisch→Spanisch) |

---

## Was gut funktionierte

1. **Report-Überarbeitung** — Direkte Textarbeit des Orchestrators war schnell und präzise, kein Subagent nötig
2. **Parallele Code-Generierung** — Frontend und Backend wurden gleichzeitig generiert, spart Zeit
3. **Schnelle Diagnose** — Orchestrator konnte aus Fehlermeldungen/Screenshots meist sofort die Ursache identifizieren
4. **Iterative Verbesserung** — Jeder Fix-Zyklus dauerte nur 1-3 Prompts
5. **Architektur-Diagramme** — HTML-Diagramme wurden fehlerfrei generiert

## Was schlecht funktionierte

1. **Kein gemeinsamer API-Vertrag** — Frontend- und Backend-Subagent hatten unterschiedliche JSON-Feldnamen (`targetText` vs `translated`). Es gab keinen Mechanismus, um einen API-Vertrag zwischen Agenten durchzusetzen → **Challenge H4: Fehlende Standards**
2. **Plattform-Blindheit** — Subagenten generierten Code in einer Linux-Sandbox, ohne zu berücksichtigen, dass der User auf macOS ARM64 arbeitet (node_modules, Gradle Wrapper) → **Challenge H3: Debugging**
3. **Dependency-Konflikte** — Subagent wählte Gson 2.10.1, obwohl Spring Boot 3.4.1 mindestens 2.11 braucht. Keine automatische Kompatibilitätsprüfung → **Challenge H3: Debugging**
4. **Spring DI nicht korrekt** — Backend-Subagent nutzte `new TranslationService()` statt Constructor Injection, wodurch `@Autowired`-Felder null waren. Grundlegender Spring-Fehler → **Challenge H3: Debugging**
5. **Kein automatischer Integrationstest** — Es gab keinen QA-Agenten, der Frontend und Backend zusammen getestet hätte. Alle 8 Fehler wurden erst vom Menschen entdeckt → **Challenge H1: Koordination**
6. **Mock-Translation unbrauchbar** — Backend gab nur `[TRANSLATED to de]: <gleicher Text>` zurück. Kein Agent prüfte, ob die Translation-Logik sinnvoll ist → **Challenge H2: Kosten vs. Nutzen**
7. **Java API-Limits nicht beachtet** — `Map.of()` unterstützt max. 10 Paare, Subagent generierte 11 → kompiliert nicht

## Mapping auf Forschungsfragen (Kapitel 1)

| Challenge                       | Beobachtung im Case Study                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **H1: Koordination**      | Subagenten arbeiteten isoliert. Kein Mechanismus für API-Absprache. 3 von 8 Fehlern waren Koordinationsprobleme (Feldnamen, DI-Wiring).                           |
| **H2: Kosten vs. Nutzen** | Code-Generierung war schnell (~5 Min für 19 Dateien), aber Debugging dauerte ~1.5h. Verhältnis Generierung:Debugging ≈ 1:6.                                     |
| **H3: Debugging**         | 8 Integrationsfehler, alle erst durch menschliches Testen entdeckt. Fehlermeldungen mussten manuell als Screenshots/Logs an den Orchestrator weitergegeben werden. |
| **H4: Standards**         | Kein API-Vertrag zwischen Frontend/Backend-Agent. JSON-Feldnamen divergierten. Kein OpenAPI-Spec oder Interface-Definition geteilt.                                |

## Fazit für den Report

Die Claude Cowork MAS-Architektur zeigt klar die in Kapitel 1 identifizierten Herausforderungen:

* **Stärke:** Schnelle parallele Code-Generierung (19 Dateien in ~5 Minuten)
* **Schwäche:** Fehlende Koordination zwischen Subagenten führte zu 8 Integrationsfehlern, die nur durch Human-in-the-Loop-Debugging gelöst werden konnten
* **Kernproblem:** Die Agenten teilen keinen expliziten API-Vertrag — jeder Agent "rät", wie die Schnittstelle aussehen soll
* **Verbesserungsvorschlag:** Ein dedizierter QA-Agent und ein geteilter API-Contract (z.B. OpenAPI-Spec) als Shared Context könnten die Fehlerrate deutlich reduzieren
