import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Hand,
  Search,
  X,
  Stethoscope,
  User,
  Wifi,
  Shield,
  Volume2,
  Languages,
  AlertCircle,
  Activity,
  Send,
  Keyboard,
  ArrowDown,
  CornerDownRight,
  Info,
} from "lucide-react";

/* =========================================================================
   SwissMedPreter — Conversation Prototype
   Single-page React frontend.
   Connects to the Spring Boot backend over:
     - REST  /api/lexicon                  (offline-cacheable medical lexicon)
     - REST  /api/conversation/translate   (translation requests)
   When the backend is unreachable the app degrades gracefully to an
   in-memory mock so the UI is still demoable in air-gapped scenarios.
   ========================================================================= */
const CASE_NUMBER = "CASE-2025-1207-A";
const API_LEXICON = "/api/lexicon";
const API_TRANSLATE = "/api/conversation/translate";
const API_ENGINE = "/api/engine";

// Human labels for the translation engine returned by the backend.
const ENGINE_LABELS = {
  libretranslate: { label: "LibreTranslate", tone: "emerald", hint: "Live on-prem translation" },
  phrasebook: { label: "Phrasebook", tone: "sky", hint: "Bundled medical phrasebook" },
  lexicon: { label: "Lexicon substitution", tone: "amber", hint: "Word-by-word lexicon fallback" },
  passthrough: { label: "Passthrough", tone: "slate", hint: "Identical source/target language" },
  mock: { label: "Local mock", tone: "slate", hint: "Backend unreachable — using browser mock" },
};

/* -------------------------------------------------------------------------
   1. Lexicon — mock of /api/lexicon
   In production this is fetched once on app load and cached for offline
   use (Service Worker, see SA Report Q7).
   ------------------------------------------------------------------------- */
const LEXICON = [
  {
    id: "wrist",
    keywords: ["wrist", "handgelenk", "polso", "poignet", "muñeca", "معصم"],
    translations: { de: "Handgelenk", en: "Wrist", ar: "مِعصَم", fr: "Poignet", it: "Polso", es: "Muñeca", tr: "Bilek", pt: "Pulso" },
    pictogram: "wrist",
  },
  {
    id: "head",
    keywords: ["head", "kopf", "testa", "tête", "cabeza", "رأس"],
    translations: { de: "Kopf", en: "Head", ar: "رأس", fr: "Tête", it: "Testa", es: "Cabeza", tr: "Kafa", pt: "Cabeça" },
    pictogram: "head",
  },
  {
    id: "heart",
    keywords: ["heart", "herz", "cuore", "coeur", "corazón", "قلب"],
    translations: { de: "Herz", en: "Heart", ar: "قلب", fr: "Coeur", it: "Cuore", es: "Corazón", tr: "Kalp", pt: "Coração" },
    pictogram: "heart",
  },
  {
    id: "stomach",
    keywords: ["stomach", "bauch", "magen", "stomaco", "estomac", "estómago", "بطن"],
    translations: { de: "Bauch", en: "Stomach", ar: "بطن", fr: "Estomac", it: "Stomaco", es: "Estómago", tr: "Mide", pt: "Estômago" },
    pictogram: "stomach",
  },
  {
    id: "lung",
    keywords: ["lung", "lunge", "polmone", "poumon", "pulmón", "رئة"],
    translations: { de: "Lunge", en: "Lung", ar: "رئة", fr: "Poumon", it: "Polmone", es: "Pulmón", tr: "Akciğer", pt: "Pulmão" },
    pictogram: "lung",
  },
  {
    id: "bone",
    keywords: ["bone", "knochen", "osso", "os", "hueso", "عظم"],
    translations: { de: "Knochen", en: "Bone", ar: "عظم", fr: "Os", it: "Osso", es: "Hueso", tr: "Kemik", pt: "Osso" },
    pictogram: "bone",
  },
  {
    id: "blood",
    keywords: ["blood", "blut", "sangue", "sang", "sangre", "دم"],
    translations: { de: "Blut", en: "Blood", ar: "دم", fr: "Sang", it: "Sangue", es: "Sangre", tr: "Kan", pt: "Sangue" },
    pictogram: "blood",
  },
  {
    id: "pain",
    keywords: ["pain", "schmerz", "schmerzen", "weh", "dolore", "douleur", "dolor", "ألم"],
    translations: { de: "Schmerz", en: "Pain", ar: "ألم", fr: "Douleur", it: "Dolore", es: "Dolor", tr: "Ağrı", pt: "Dor" },
    pictogram: "pain",
  },
  {
    id: "fever",
    keywords: ["fever", "fieber", "febbre", "fièvre", "fiebre", "حُمّى"],
    translations: { de: "Fieber", en: "Fever", ar: "حُمّى", fr: "Fièvre", it: "Febbre", es: "Fiebre", tr: "Ateş", pt: "Febre" },
    pictogram: "fever",
  },
  {
    id: "infection",
    keywords: ["infection", "infektion", "infezione", "infección", "عدوى"],
    translations: { de: "Infektion", en: "Infection", ar: "عدوى", fr: "Infection", it: "Infezione", es: "Infección", tr: "Enfeksiyon", pt: "Infecção" },
    pictogram: "infection",
  },
  {
    id: "medication",
    keywords: ["medication", "medikament", "medizin", "medicina", "médicament", "medicamento", "دواء"],
    translations: { de: "Medikament", en: "Medication", ar: "دواء", fr: "Médicament", it: "Medicina", es: "Medicamento", tr: "İlaç", pt: "Medicação" },
    pictogram: "medication",
  },
  {
    id: "allergy",
    keywords: ["allergy", "allergie", "allergia", "alergia", "حساسية"],
    translations: { de: "Allergie", en: "Allergy", ar: "حساسية", fr: "Allergie", it: "Allergia", es: "Alergia", tr: "Alerji", pt: "Alergia" },
    pictogram: "allergy",
  },
  {
    id: "fall",
    keywords: ["fall", "fallen", "gestürzt", "stürzen", "caduto", "tombé", "caído", "سقط"],
    translations: { de: "Sturz", en: "Fall", ar: "سقوط", fr: "Chute", it: "Caduta", es: "Caída", tr: "Düşme", pt: "Queda" },
    pictogram: "fall",
  },
  {
    id: "breath",
    keywords: ["breath", "atmung", "atmen", "respiro", "respiration", "respiración", "تنفس"],
    translations: { de: "Atmung", en: "Breath", ar: "تنفس", fr: "Respiration", it: "Respiro", es: "Respiración", tr: "Nefes", pt: "Respiração" },
    pictogram: "breath",
  },
  {
    id: "back",
    keywords: ["back", "rücken", "ruecken", "schiena", "dos", "espalda", "ظهر"],
    translations: { de: "Rücken", en: "Back", ar: "ظهر", fr: "Dos", it: "Schiena", es: "Espalda", tr: "Sırt", pt: "Costas" },
    pictogram: "back",
  },
  {
    id: "leg",
    keywords: ["leg", "bein", "gamba", "jambe", "pierna", "ساق"],
    translations: { de: "Bein", en: "Leg", ar: "ساق", fr: "Jambe", it: "Gamba", es: "Pierna", tr: "Bacak", pt: "Perna" },
    pictogram: "leg",
  },
  {
    id: "arm",
    keywords: ["arm", "braccio", "bras", "brazo", "ذراع"],
    translations: { de: "Arm", en: "Arm", ar: "ذراع", fr: "Bras", it: "Braccio", es: "Brazo", tr: "Kol", pt: "Braço" },
    pictogram: "arm",
  },
  {
    id: "eye",
    keywords: ["eye", "auge", "augen", "occhio", "œil", "oeil", "ojo", "عين"],
    translations: { de: "Auge", en: "Eye", ar: "عين", fr: "Œil", it: "Occhio", es: "Ojo", tr: "Göz", pt: "Olho" },
    pictogram: "eye",
  },
  {
    id: "ear",
    keywords: ["ear", "ohr", "ohren", "orecchio", "oreille", "oreja", "أذن"],
    translations: { de: "Ohr", en: "Ear", ar: "أذن", fr: "Oreille", it: "Orecchio", es: "Oreja", tr: "Kulak", pt: "Ouvido" },
    pictogram: "ear",
  },
  {
    id: "throat",
    keywords: ["throat", "hals", "rachen", "gola", "gorge", "garganta", "حلق"],
    translations: { de: "Hals", en: "Throat", ar: "حلق", fr: "Gorge", it: "Gola", es: "Garganta", tr: "Boğaz", pt: "Garganta" },
    pictogram: "throat",
  },
  {
    id: "tooth",
    keywords: ["tooth", "teeth", "zahn", "zähne", "zaehne", "dente", "denti", "dent", "diente", "سن", "ضرس"],
    translations: { de: "Zahn", en: "Tooth", ar: "سن", fr: "Dent", it: "Dente", es: "Diente", tr: "Diş", pt: "Dente" },
    pictogram: "tooth",
  },
  {
    id: "cough",
    keywords: ["cough", "husten", "tosse", "toux", "tos", "سعال"],
    translations: { de: "Husten", en: "Cough", ar: "سعال", fr: "Toux", it: "Tosse", es: "Tos", tr: "Öksürük", pt: "Tosse" },
    pictogram: "cough",
  },
  {
    id: "nausea",
    keywords: ["nausea", "übelkeit", "uebelkeit", "übel", "uebel", "nausée", "náusea", "غثيان"],
    translations: { de: "Übelkeit", en: "Nausea", ar: "غثيان", fr: "Nausée", it: "Nausea", es: "Náusea", tr: "Bulantı", pt: "Náusea" },
    pictogram: "nausea",
  },
  {
    id: "dizziness",
    keywords: ["dizziness", "dizzy", "schwindel", "schwindlig", "vertigine", "vertige", "mareo", "دوار"],
    translations: { de: "Schwindel", en: "Dizziness", ar: "دوار", fr: "Vertige", it: "Vertigine", es: "Mareo", tr: "Baş dönmesi", pt: "Tontura" },
    pictogram: "dizziness",
  },
];

/* -------------------------------------------------------------------------
   2. SVG Pictograms — minimal, calm, uniform stroke.
   Designed for low-literacy comprehension (SA Report R07, R13).
   ------------------------------------------------------------------------- */
const Pictogram = ({ id, className = "w-full h-full" }) => {
  const stroke = "currentColor";
  const sw = 1.5;
  const common = { fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "wrist":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="wrist">
          {/* Forearm */}
          <path {...common} d="M22 60v-14" />
          <path {...common} d="M42 60v-14" />
          {/* Wrist band — highlighted */}
          <rect x="20" y="38" width="24" height="8" rx="2" fill="currentColor" fillOpacity="0.18" stroke={stroke} strokeWidth={sw} />
          {/* Palm */}
          <path {...common} d="M20 38v-6c0-2 2-3 4-3h16c2 0 4 1 4 3v6" />
          {/* Fingers */}
          <path {...common} d="M22 29v-14a2 2 0 0 1 4 0v14" />
          <path {...common} d="M28 29v-17a2 2 0 0 1 4 0v17" />
          <path {...common} d="M34 29v-17a2 2 0 0 1 4 0v17" />
          <path {...common} d="M40 29v-12a2 2 0 0 1 4 0v12" />
        </svg>
      );
    case "head":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="head">
          <circle cx="32" cy="26" r="14" {...common} />
          <path {...common} d="M22 40c0 6 4 10 10 10s10-4 10-10" />
          <circle cx="27" cy="24" r="1.2" fill={stroke} stroke="none" />
          <circle cx="37" cy="24" r="1.2" fill={stroke} stroke="none" />
          <path {...common} d="M28 32c2 1 4 1 6 0" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="heart">
          <path {...common} d="M32 52 C12 38 10 24 18 18 c4-3 10-2 14 4 4-6 10-7 14-4 8 6 6 20 -14 34z" fill="currentColor" fillOpacity="0.15" />
          {/* ECG line */}
          <path {...common} d="M20 32 h6 l3-5 l3 10 l3-5 h7" strokeWidth="1.5" />
        </svg>
      );
    case "stomach":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="stomach">
          <path {...common} d="M22 18c0-2 2-4 4-4h6v8c8 0 14 6 14 14 0 10-8 16-16 16s-14-4-14-12c0-6 4-10 6-12v-10z" />
          <path {...common} d="M28 32c2 2 6 2 8 0" />
        </svg>
      );
    case "lung":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="lung">
          <path {...common} d="M32 14v22" />
          <path {...common} d="M32 18c-2 0-4 1-6 4-4 6-8 10-8 18 0 6 4 8 8 8 4 0 6-2 6-6V18z" />
          <path {...common} d="M32 18c2 0 4 1 6 4 4 6 8 10 8 18 0 6-4 8-8 8-4 0-6-2-6-6V18z" />
        </svg>
      );
    case "bone":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="bone">
          <path {...common} d="M16 20a4 4 0 0 1 4-8 4 4 0 0 1 4 4 4 4 0 0 1 8 0 4 4 0 0 1 8 0 4 4 0 0 1 4-4 4 4 0 0 1 4 8 4 4 0 0 1 0 8 4 4 0 0 1-4 8 4 4 0 0 1-4-4 4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-4 4 4 4 0 0 1-4-8 4 4 0 0 1 0-8z" />
        </svg>
      );
    case "blood":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="blood">
          {/* Droplet */}
          <path {...common} d="M32 8 C32 8 16 28 16 42 a16 16 0 0 0 32 0 C48 28 32 8 32 8z" fill="currentColor" fillOpacity="0.18" />
          {/* Highlight */}
          <path {...common} d="M24 38 c0 5 3 8 6 8" strokeWidth="1.2" />
        </svg>
      );
    case "pain":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="pain">
          {/* Lightning bolt — universally understood pain icon */}
          <path {...common} d="M34 6 L16 36 L28 36 L24 58 L48 26 L36 26 L40 6 Z" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "fever":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="fever">
          {/* Thermometer body */}
          <rect x="27" y="8" width="10" height="36" rx="5" {...common} />
          {/* Bulb */}
          <circle cx="32" cy="50" r="7" {...common} fill="currentColor" fillOpacity="0.18" />
          {/* Mercury column */}
          <path {...common} d="M32 18v28" strokeWidth="3" />
          {/* Tick marks */}
          <path {...common} d="M40 16h4M40 24h4M40 32h4" strokeWidth="1" />
        </svg>
      );
    case "infection":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="infection">
          <circle cx="32" cy="32" r="10" {...common} />
          <path {...common} d="M32 22v-8M32 50v-8M22 32h-8M50 32h-8M25 25l-6-6M45 45l6 6M25 39l-6 6M45 19l6-6" />
          <circle cx="32" cy="32" r="3" fill={stroke} stroke="none" />
        </svg>
      );
    case "medication":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="medication">
          {/* Capsule — left half filled */}
          <rect x="14" y="24" width="36" height="16" rx="8" {...common} />
          <rect x="14" y="24" width="18" height="16" rx="8" fill="currentColor" fillOpacity="0.18" stroke="none" />
          <path {...common} d="M32 24v16" />
        </svg>
      );
    case "allergy":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="allergy">
          {/* Face */}
          <circle cx="32" cy="32" r="18" {...common} />
          {/* Eyes */}
          <circle cx="25" cy="28" r="1.5" fill={stroke} stroke="none" />
          <circle cx="39" cy="28" r="1.5" fill={stroke} stroke="none" />
          {/* Worried mouth */}
          <path {...common} d="M26 42 q6 -4 12 0" />
          {/* Rash spots */}
          <circle cx="22" cy="36" r="1.8" fill={stroke} stroke="none" />
          <circle cx="42" cy="36" r="1.8" fill={stroke} stroke="none" />
          <circle cx="20" cy="28" r="1.4" fill={stroke} stroke="none" />
          <circle cx="44" cy="28" r="1.4" fill={stroke} stroke="none" />
          <circle cx="29" cy="44" r="1.4" fill={stroke} stroke="none" />
          <circle cx="35" cy="44" r="1.4" fill={stroke} stroke="none" />
        </svg>
      );
    case "fall":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="fall">
          {/* Person falling — head, body, limbs in motion */}
          <circle cx="18" cy="20" r="5" {...common} />
          {/* Torso */}
          <path {...common} d="M22 24 L34 30" />
          {/* Arms */}
          <path {...common} d="M22 24 L14 32" />
          <path {...common} d="M28 27 L40 22" />
          {/* Legs */}
          <path {...common} d="M34 30 L46 36" />
          <path {...common} d="M34 30 L42 44" />
          {/* Ground line */}
          <path {...common} d="M10 54 H54" strokeWidth="2.5" />
          {/* Motion lines */}
          <path {...common} d="M50 14 l-4 4" strokeWidth="1" />
          <path {...common} d="M54 22 l-4 2" strokeWidth="1" />
        </svg>
      );
    case "breath":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="breath">
          {/* Trachea */}
          <path {...common} d="M32 12v20" />
          {/* Left lung */}
          <path {...common} d="M30 22h-6a4 4 0 0 0-4 4v14c0 6 4 10 8 10s4-4 4-8V22z" fill="currentColor" fillOpacity="0.12" />
          {/* Right lung */}
          <path {...common} d="M34 22h6a4 4 0 0 1 4 4v14c0 6-4 10-8 10s-4-4-4-8V22z" fill="currentColor" fillOpacity="0.12" />
          {/* In/out arrows */}
          <path {...common} d="M28 8l4-4 4 4" strokeWidth={sw} />
        </svg>
      );
    case "back":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="back">
          {/* Spine / back silhouette */}
          <path {...common} d="M32 8 a6 6 0 0 1 0 12 a6 6 0 0 1 0 -12 z" />
          <path {...common} d="M26 22 h12 v8 h-12 z" />
          <path {...common} d="M32 30 v24" strokeWidth="3" />
          <path {...common} d="M28 34 h8" />
          <path {...common} d="M27 40 h10" />
          <path {...common} d="M28 46 h8" />
          <path {...common} d="M27 52 h10" />
        </svg>
      );
    case "leg":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="leg">
          <path {...common} d="M26 8 h12 v14 q0 8 -4 14 l-4 18" fill="currentColor" fillOpacity="0.12" />
          <path {...common} d="M30 54 h10 v4 h-12 z" />
          <path {...common} d="M32 30 q-2 6 -4 12" strokeWidth="1.2" />
        </svg>
      );
    case "arm":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="arm">
          {/* Shoulder + upper arm + forearm + hand */}
          <circle cx="16" cy="14" r="6" {...common} />
          <path {...common} d="M20 18 L36 26 L48 38" strokeWidth="6" strokeLinecap="round" fill="currentColor" fillOpacity="0.12" />
          <circle cx="50" cy="40" r="5" {...common} fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="eye">
          <path {...common} d="M8 32 Q32 12 56 32 Q32 52 8 32 z" fill="currentColor" fillOpacity="0.08" />
          <circle cx="32" cy="32" r="8" {...common} fill="currentColor" fillOpacity="0.2" />
          <circle cx="32" cy="32" r="3" fill={stroke} stroke="none" />
        </svg>
      );
    case "ear":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="ear">
          <path {...common} d="M40 14 a14 14 0 0 0 -22 8 c-2 8 2 14 4 18 c2 4 0 10 4 12 c4 2 8 -2 8 -6 c0 -4 4 -4 6 -8 c2 -4 4 -8 4 -14 a10 10 0 0 0 -4 -10 z" fill="currentColor" fillOpacity="0.12" />
          <path {...common} d="M30 26 a4 4 0 0 1 6 4 c0 4 -4 4 -4 8" />
        </svg>
      );
    case "throat":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="throat">
          {/* Head profile with throat highlighted */}
          <path {...common} d="M22 10 a14 14 0 0 1 14 14 v6 l4 4 v6 q0 8 -8 8 h-10 v14" fill="currentColor" fillOpacity="0.08" />
          {/* Throat highlight */}
          <ellipse cx="28" cy="36" rx="3" ry="6" {...common} fill="currentColor" fillOpacity="0.3" />
        </svg>
      );
    case "tooth":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="tooth">
          <path {...common} d="M20 14 q12 -6 24 0 q4 4 2 12 q-2 8 -4 16 q-2 8 -6 8 q-3 0 -4 -8 q-1 -8 -4 -8 q-3 0 -4 8 q-1 8 -4 8 q-4 0 -6 -8 q-2 -8 -4 -16 q-2 -8 2 -12 z" fill="currentColor" fillOpacity="0.12" />
        </svg>
      );
    case "cough":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="cough">
          {/* Head profile */}
          <circle cx="22" cy="24" r="10" {...common} fill="currentColor" fillOpacity="0.1" />
          <path {...common} d="M22 34 v8" />
          {/* Cough puffs */}
          <circle cx="36" cy="22" r="3" {...common} fill="currentColor" fillOpacity="0.2" />
          <circle cx="44" cy="20" r="2.5" {...common} fill="currentColor" fillOpacity="0.2" />
          <circle cx="50" cy="24" r="2" {...common} fill="currentColor" fillOpacity="0.2" />
          <path {...common} d="M14 22 q-2 -2 -2 -4" strokeWidth="1" />
        </svg>
      );
    case "nausea":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="nausea">
          {/* Sick face */}
          <circle cx="32" cy="30" r="18" {...common} fill="currentColor" fillOpacity="0.08" />
          {/* Spiral eyes */}
          <path {...common} d="M22 26 q3 -3 5 0 q-2 2 -3 0" strokeWidth="1.2" />
          <path {...common} d="M37 26 q3 -3 5 0 q-2 2 -3 0" strokeWidth="1.2" />
          {/* Wavy mouth */}
          <path {...common} d="M24 40 q2 -3 4 0 q2 3 4 0 q2 -3 4 0 q2 3 4 0" />
        </svg>
      );
    case "dizziness":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="dizziness">
          {/* Head */}
          <circle cx="32" cy="32" r="14" {...common} fill="currentColor" fillOpacity="0.08" />
          {/* Spiral around */}
          <path {...common} d="M32 32 m -10 0 a10 10 0 1 0 20 0 a8 8 0 1 0 -16 0 a6 6 0 1 0 12 0 a4 4 0 1 0 -8 0" strokeWidth="1.2" />
          {/* Stars */}
          <path {...common} d="M10 16 l2 2 l-2 2 l-2 -2 z" />
          <path {...common} d="M52 14 l2 2 l-2 2 l-2 -2 z" />
        </svg>
      );
    default:
      // Unknown lexicon entry (e.g., a category we haven't drawn yet):
      // render a neutral placeholder rather than nothing.
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label={id || "term"}>
          <circle cx="32" cy="32" r="20" {...common} />
          <path {...common} d="M26 26h12M26 32h12M26 38h8" />
        </svg>
      );
  }
};

/* -------------------------------------------------------------------------
   3. Languages — 20 supported languages (SA Report R04)
   ------------------------------------------------------------------------- */
const LANGUAGES = [
  { code: "de", name: "Deutsch", flag: "🇩🇪", rtl: false },
  { code: "en", name: "English", flag: "🇬🇧", rtl: false },
  { code: "fr", name: "Français", flag: "🇫🇷", rtl: false },
  { code: "it", name: "Italiano", flag: "🇮🇹", rtl: false },
  { code: "es", name: "Español", flag: "🇪🇸", rtl: false },
  { code: "pt", name: "Português", flag: "🇵🇹", rtl: false },
  { code: "ar", name: "العربية", flag: "🇸🇦", rtl: true },
  { code: "tr", name: "Türkçe", flag: "🇹🇷", rtl: false },
  { code: "sq", name: "Shqip", flag: "🇦🇱", rtl: false },
  { code: "sr", name: "Српски", flag: "🇷🇸", rtl: false },
  { code: "ru", name: "Русский", flag: "🇷🇺", rtl: false },
  { code: "uk", name: "Українська", flag: "🇺🇦", rtl: false },
  { code: "pl", name: "Polski", flag: "🇵🇱", rtl: false },
  { code: "hr", name: "Hrvatski", flag: "🇭🇷", rtl: false },
  { code: "nl", name: "Nederlands", flag: "🇳🇱", rtl: false },
  { code: "zh", name: "中文", flag: "🇨🇳", rtl: false },
  { code: "fa", name: "فارسی", flag: "🇮🇷", rtl: true },
  { code: "ti", name: "ትግርኛ", flag: "🇪🇷", rtl: false },
  { code: "so", name: "Soomaali", flag: "🇸🇴", rtl: false },
  { code: "ur", name: "اردو", flag: "🇵🇰", rtl: true },
];

/* -------------------------------------------------------------------------
   4. Mock translation engine
   In production: WebSocket → Spring Boot → on-prem LLM container.
   Latency target: <2 s (SA Report Q2). We use 700-1400 ms randomised.
   ------------------------------------------------------------------------- */
const SAMPLE_PHRASES = {
  staff: [
    { de: "Guten Tag, was kann ich für Sie tun?", topic: null },
    { de: "Können Sie mir zeigen, wo es weh tut?", topic: "pain" },
    { de: "Haben Sie Schmerzen am Handgelenk?", topic: "wrist" },
    { de: "Hatten Sie Fieber in den letzten Tagen?", topic: "fever" },
    { de: "Nehmen Sie aktuell Medikamente?", topic: "medication" },
    { de: "Haben Sie irgendwelche Allergien?", topic: "allergy" },
    { de: "Atmen Sie bitte tief ein.", topic: "breath" },
    { de: "Ich sehe Anzeichen einer Infektion.", topic: "infection" },
  ],
  patient: [
    { content: "Ich bin gestern beim Biken gestürzt und kann nun mein Handgelenk nicht mehr bewegen.", topic: "wrist" },
    { content: "Mein Kopf tut sehr weh, seit heute Morgen.", topic: "head" },
    { content: "Ich habe seit zwei Tagen Fieber.", topic: "fever" },
    { content: "Ich nehme jeden Tag Blutdruckmedikamente.", topic: "medication" },
    { content: "Ich bin allergisch gegen Penizillin.", topic: "allergy" },
    { content: "Mein Bauch tut weh, vor allem nach dem Essen.", topic: "stomach" },
    { content: "Ich kann nicht richtig atmen.", topic: "breath" },
  ],
};

// Naive but deterministic mock translation: substitute known terms via lexicon.
function mockTranslate(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) return text;
  let translated = text;
  // Find and replace lexicon terms with target-language equivalents
  for (const entry of LEXICON) {
    const sourceWord = entry.translations[sourceLang];
    const targetWord = entry.translations[targetLang];
    if (sourceWord && targetWord) {
      const re = new RegExp(`\\b${sourceWord}\\b`, "gi");
      translated = translated.replace(re, targetWord);
    }
  }
  // Add a marker so user can see translation occurred for non-medical text
  if (translated === text && targetLang !== sourceLang) {
    // Provide canned translations for the demo phrases
    const canned = {
      "Guten Tag, was kann ich für Sie tun?": {
        en: "Hello, how can I help you?",
        ar: "مرحبا، كيف يمكنني مساعدتك؟",
        fr: "Bonjour, comment puis-je vous aider?",
        it: "Buongiorno, come posso aiutarla?",
        es: "Hola, ¿cómo puedo ayudarle?",
        tr: "Merhaba, size nasıl yardımcı olabilirim?",
        sq: "Përshëndetje, si mund t'ju ndihmoj?",
      },
      "Können Sie mir zeigen, wo es weh tut?": {
        en: "Can you show me where it hurts?",
        ar: "هل يمكنك أن تريني أين الألم؟",
        fr: "Pouvez-vous me montrer où ça fait mal?",
        it: "Può mostrarmi dove fa male?",
        es: "¿Puede mostrarme dónde le duele?",
        tr: "Nereniz acıyor gösterebilir misiniz?",
        sq: "A mund të më tregoni ku ju dhemb?",
      },
      "Haben Sie Schmerzen am Handgelenk?": {
        en: "Do you have pain in your wrist?",
        ar: "هل تشعر بألم في معصمك؟",
        fr: "Avez-vous mal au poignet?",
        it: "Ha dolore al polso?",
        es: "¿Tiene dolor en la muñeca?",
        tr: "Bileğinizde ağrı var mı?",
        sq: "A keni dhimbje në kyçin e dorës?",
      },
      "Hatten Sie Fieber in den letzten Tagen?": {
        en: "Have you had a fever in the last few days?",
        ar: "هل أصبت بالحمى في الأيام القليلة الماضية؟",
        fr: "Avez-vous eu de la fièvre ces derniers jours?",
        it: "Ha avuto febbre negli ultimi giorni?",
        es: "¿Ha tenido fiebre en los últimos días?",
        tr: "Son birkaç gün ateşiniz oldu mu?",
        sq: "A keni pasur temperaturë në ditët e fundit?",
      },
      "Nehmen Sie aktuell Medikamente?": {
        en: "Are you currently taking any medication?",
        ar: "هل تتناول أي دواء حاليا؟",
        fr: "Prenez-vous actuellement des médicaments?",
        it: "Sta assumendo farmaci attualmente?",
        es: "¿Está tomando medicación actualmente?",
        tr: "Şu anda ilaç kullanıyor musunuz?",
        sq: "A jeni duke marrë barna aktualisht?",
      },
      "Haben Sie irgendwelche Allergien?": {
        en: "Do you have any allergies?",
        ar: "هل لديك أي حساسية؟",
        fr: "Avez-vous des allergies?",
        it: "Ha qualche allergia?",
        es: "¿Tiene alguna alergia?",
        tr: "Herhangi bir alerjiniz var mı?",
        sq: "A keni ndonjë alergji?",
      },
      "Atmen Sie bitte tief ein.": {
        en: "Please take a deep breath.",
        ar: "من فضلك خذ نفسا عميقا.",
        fr: "Veuillez respirer profondément.",
        it: "Per favore, faccia un respiro profondo.",
        es: "Por favor, respire profundamente.",
        tr: "Lütfen derin bir nefes alın.",
        sq: "Ju lutem merrni një frymë të thellë.",
      },
      "Ich sehe Anzeichen einer Infektion.": {
        en: "I see signs of an infection.",
        ar: "أرى علامات على وجود عدوى.",
        fr: "Je vois des signes d'infection.",
        it: "Vedo segni di un'infezione.",
        es: "Veo signos de una infección.",
        tr: "Enfeksiyon belirtileri görüyorum.",
        sq: "Shoh shenja të një infeksioni.",
      },
      "Ich bin gestern beim Biken gestürzt und kann nun mein Handgelenk nicht mehr bewegen.": {
        en: "I fell while biking yesterday and now I can't move my wrist.",
        ar: "لقد سقطت أمس أثناء ركوب الدراجة وأصبح من الصعب علي تحريك معصمي.",
        fr: "Je suis tombé en faisant du vélo hier et je ne peux plus bouger mon poignet.",
        it: "Sono caduto in bicicletta ieri e ora non riesco a muovere il polso.",
        es: "Me caí en bicicleta ayer y ahora no puedo mover la muñeca.",
        tr: "Dün bisiklet sürerken düştüm ve şimdi bileğimi hareket ettiremiyorum.",
        sq: "Ramë dje duke ngarë biçikletën dhe tani nuk mund ta lëviz kyçin e dorës.",
      },
      "Mein Kopf tut sehr weh, seit heute Morgen.": {
        en: "My head hurts a lot, since this morning.",
        ar: "رأسي يؤلمني كثيرا منذ هذا الصباح.",
        fr: "J'ai très mal à la tête depuis ce matin.",
        it: "Mi fa molto male la testa da stamattina.",
        es: "Me duele mucho la cabeza desde esta mañana.",
        tr: "Bu sabahtan beri başım çok ağrıyor.",
        sq: "Më dhemb shumë koka, që nga sot në mëngjes.",
      },
      "Ich habe seit zwei Tagen Fieber.": {
        en: "I have had a fever for two days.",
        ar: "لدي حمى منذ يومين.",
        fr: "J'ai de la fièvre depuis deux jours.",
        it: "Ho la febbre da due giorni.",
        es: "Tengo fiebre desde hace dos días.",
        tr: "İki gündür ateşim var.",
        sq: "Kam temperaturë prej dy ditësh.",
      },
      "Ich nehme jeden Tag Blutdruckmedikamente.": {
        en: "I take blood pressure medication every day.",
        ar: "أتناول دواء ضغط الدم كل يوم.",
        fr: "Je prends des médicaments contre la tension tous les jours.",
        it: "Prendo medicine per la pressione ogni giorno.",
        es: "Tomo medicación para la presión todos los días.",
        tr: "Her gün tansiyon ilacı alıyorum.",
        sq: "Marr çdo ditë barna për presionin e gjakut.",
      },
      "Ich bin allergisch gegen Penizillin.": {
        en: "I am allergic to penicillin.",
        ar: "لدي حساسية من البنسلين.",
        fr: "Je suis allergique à la pénicilline.",
        it: "Sono allergico alla penicillina.",
        es: "Soy alérgico a la penicilina.",
        tr: "Penisiline alerjim var.",
        sq: "Jam alergjik ndaj penicilinës.",
      },
      "Mein Bauch tut weh, vor allem nach dem Essen.": {
        en: "My stomach hurts, especially after eating.",
        ar: "بطني يؤلمني، خاصة بعد الأكل.",
        fr: "J'ai mal au ventre, surtout après les repas.",
        it: "Mi fa male lo stomaco, soprattutto dopo i pasti.",
        es: "Me duele el estómago, especialmente después de comer.",
        tr: "Karnım ağrıyor, özellikle yedikten sonra.",
        sq: "Më dhemb stomaku, sidomos pas ngrënies.",
      },
      "Ich kann nicht richtig atmen.": {
        en: "I cannot breathe properly.",
        ar: "لا أستطيع التنفس بشكل صحيح.",
        fr: "Je ne peux pas bien respirer.",
        it: "Non riesco a respirare bene.",
        es: "No puedo respirar bien.",
        tr: "Doğru nefes alamıyorum.",
        sq: "Nuk mund të marr frymë si duhet.",
      },
    };
    if (canned[text] && canned[text][targetLang]) {
      return canned[text][targetLang];
    }
  }
  return translated;
}

// Detect lexicon hits from a piece of text.
// Short keywords (≤4 chars) require a word boundary to avoid false
// positives like Turkish "kan" (blood) matching inside German "kann".
// Longer keywords use substring matching so German compounds like
// "Bauchschmerzen" pull both "bauch" (stomach) and "schmerz" (pain).
function matchesAny(lower, needles) {
  for (const raw of needles) {
    if (!raw) continue;
    const n = raw.toLowerCase();
    if (n.length <= 4) {
      const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "u");
      if (re.test(lower)) return true;
    } else if (lower.includes(n)) {
      return true;
    }
  }
  return false;
}

function detectKeywords(text, langCode, lexicon = LEXICON) {
  const lower = (text || "").toLowerCase();
  const hits = [];
  for (const entry of lexicon) {
    let matched = matchesAny(lower, entry.keywords);
    if (!matched) {
      const t = entry.translations[langCode];
      if (t && matchesAny(lower, [t])) matched = true;
    }
    if (matched) hits.push(entry);
  }
  return hits;
}

// Map our short language codes to BCP-47 tags for the Web Speech API.
function bcp47(code) {
  const map = {
    de: "de-CH", en: "en-US", fr: "fr-FR", it: "it-IT", es: "es-ES",
    pt: "pt-PT", ar: "ar-SA", tr: "tr-TR", sq: "sq-AL", sr: "sr-RS",
    ru: "ru-RU", uk: "uk-UA", pl: "pl-PL", hr: "hr-HR", nl: "nl-NL",
    zh: "zh-CN", fa: "fa-IR", ti: "am-ET", so: "so-SO", ur: "ur-PK",
  };
  return map[code] || "en-US";
}

/**
 * Browser-native speech recognition (Chromium, Edge, Safari).
 * Returns { supported, listening, interim, start, stop }.
 * The hook never throws if SpeechRecognition is absent — the UI degrades to text-only.
 */
function useSpeechRecognition({ lang, onFinal }) {
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    recognitionRef.current = r;
    return () => {
      try { r.abort(); } catch { /* noop */ }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = bcp47(lang);
  }, [lang]);

  const start = () => {
    const r = recognitionRef.current;
    if (!r || listening) return;
    setInterim("");
    let finalText = "";
    r.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      setInterim(interimText);
    };
    r.onerror = () => { setListening(false); setInterim(""); };
    r.onend = () => {
      setListening(false);
      setInterim("");
      const trimmed = finalText.trim();
      if (trimmed) onFinal(trimmed);
    };
    try {
      r.start();
      setListening(true);
    } catch { /* already started */ }
  };

  const stop = () => {
    const r = recognitionRef.current;
    if (!r) return;
    try { r.stop(); } catch { /* noop */ }
  };

  return { supported, listening, interim, start, stop };
}

/* -------------------------------------------------------------------------
   5. Tiny UI primitives in shadcn style (using Tailwind core only).
   ------------------------------------------------------------------------- */
const Btn = ({ children, variant = "default", size = "md", className = "", ...rest }) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-400 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-sm",
    ghost: "text-slate-700 hover:bg-slate-100",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  const sizes = { sm: "px-2.5 py-1 text-xs", md: "px-3.5 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

const Toggle = ({ checked, onChange, label, accent = "sky" }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`group inline-flex items-center gap-2.5 rounded-md px-2.5 py-1.5 hover:bg-slate-100 transition`}
  >
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <span
      className={`relative inline-block h-5 w-9 rounded-full transition ${
        checked ? (accent === "amber" ? "bg-amber-500" : "bg-sky-600") : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </span>
  </button>
);

/* -------------------------------------------------------------------------
   6. Main App
   ------------------------------------------------------------------------- */
export default function App() {
  const [staffLang, setStaffLang] = useState("de");
  const [patientLang, setPatientLang] = useState("ar");
  const [sessionActive, setSessionActive] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [messages, setMessages] = useState([]); // { id, speaker, original, sourceLang, translation, targetLang, time, status, terms }
  const [pendingTranslation, setPendingTranslation] = useState(false);
  const [activePictogram, setActivePictogram] = useState(null);
  const [pictogramHistory, setPictogramHistory] = useState([]); // last detected
  const [lexiconQuery, setLexiconQuery] = useState("");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [lexicon, setLexicon] = useState(LEXICON);
  const [backendOnline, setBackendOnline] = useState(false);
  const [engineInfo, setEngineInfo] = useState(null); // { primary, libretranslate: {...}, phrasebook: {...} }
  const [lastEngine, setLastEngine] = useState(null); // engine id of most recent translation
  const transcriptEndRef = useRef(null);

  // Fetch the lexicon + engine metadata from the backend on mount.
  // Success flips backendOnline=true, which switches translation from the
  // in-memory mock to the real /api/conversation/translate endpoint.
  useEffect(() => {
    let cancelled = false;
    fetch(API_LEXICON)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) setLexicon(data);
        setBackendOnline(true);
      })
      .catch(() => {
        // Air-gapped or backend down: keep the embedded lexicon + mock translator.
      });
    fetch(API_ENGINE)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setEngineInfo(data);
        if (data?.primary) setLastEngine(data.primary);
      })
      .catch(() => {
        // Ignore — older backends or offline mode.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Seed: a starter greeting from staff in their own language so the
  // initial transcript line matches the configured source language.
  useEffect(() => {
    const greeting = staffLang === "de"
      ? "Guten Tag, was kann ich für Sie tun?"
      : mockTranslate("Guten Tag, was kann ich für Sie tun?", "de", staffLang);
    pushMessage("staff", greeting, staffLang, patientLang);
    // eslint-disable-next-line
  }, []);

  // Hands-free auto-trigger: every 6 s emit a sample patient utterance
  // in the patient's currently selected language.
  useEffect(() => {
    if (!handsFree || !sessionActive) return;
    const t = setInterval(() => sampleAs("patient"), 6500);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [handsFree, sessionActive, staffLang, patientLang]);

  function promotePictogram(entry) {
    if (!entry) return;
    setActivePictogram(entry);
    setPictogramHistory((p) => {
      const next = [entry, ...p.filter((e) => e.id !== entry.id)];
      return next.slice(0, 6);
    });
  }

  function finishMessage(id, translation, terms, latency, engine) {
    setLatencyMs(latency);
    if (engine) setLastEngine(engine);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, translation, status: "done", terms: terms.length ? terms : m.terms, engine: engine || m.engine }
          : m
      )
    );
    if (terms[0]) promotePictogram(terms[0]);
    setPendingTranslation(false);
  }

  function pushMessage(speaker, text, sourceLang, targetLang) {
    const id = crypto.randomUUID();
    const now = new Date();
    const initialTerms = detectKeywords(text, sourceLang);
    setMessages((prev) => [
      ...prev,
      {
        id,
        speaker,
        original: text,
        sourceLang,
        translation: null,
        targetLang,
        time: now,
        status: "translating",
        terms: initialTerms,
      },
    ]);
    if (initialTerms[0]) promotePictogram(initialTerms[0]);
    setPendingTranslation(true);
    const start = performance.now();

    if (backendOnline) {
      fetch(API_TRANSLATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseNumber: CASE_NUMBER,
          speaker: speaker.toUpperCase(),
          text,
          sourceLang,
          targetLang,
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((data) => {
          const detected = (data.detectedTerms || [])
            .map((tid) => lexicon.find((e) => e.id === tid) || LEXICON.find((e) => e.id === tid))
            .filter(Boolean);
          const elapsed = data.latencyMs ?? Math.round(performance.now() - start);
          finishMessage(id, data.translation ?? text, detected, elapsed, data.engine || "phrasebook");
        })
        .catch(() => {
          // Backend hiccup: degrade to local mock so the UX stays alive.
          const translated = mockTranslate(text, sourceLang, targetLang);
          finishMessage(id, translated, initialTerms, Math.round(performance.now() - start), "mock");
        });
    } else {
      const delay = 700 + Math.random() * 700; // 700-1400 ms — matches backend latency budget
      setTimeout(() => {
        const translated = mockTranslate(text, sourceLang, targetLang);
        finishMessage(id, translated, initialTerms, Math.round(performance.now() - start), "mock");
      }, delay);
    }
  }

  // Submit a real utterance from voice/text. Source language is the speaker's
  // own configured language; target is the counterpart's language.
  function submit(speaker, text) {
    if (!sessionActive) return;
    const t = (text || "").trim();
    if (!t) return;
    const src = speaker === "staff" ? staffLang : patientLang;
    const tgt = speaker === "staff" ? patientLang : staffLang;
    pushMessage(speaker, t, src, tgt);
  }

  // Demo helper: drop a random sample phrase into the conversation
  // so the prototype is demoable without typing.
  // Sample phrases are stored in German, so we mock-translate them into the
  // currently configured language for the speaker — that way the source
  // language label always matches what the user picked in the language
  // selector instead of always saying "de".
  function sampleAs(speaker) {
    if (!sessionActive) return;
    const pool = speaker === "staff" ? SAMPLE_PHRASES.staff : SAMPLE_PHRASES.patient;
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    const germanText = speaker === "staff" ? phrase.de : phrase.content;
    const speakerLang = speaker === "staff" ? staffLang : patientLang;
    const localized = speakerLang === "de" ? germanText : mockTranslate(germanText, "de", speakerLang);
    submit(speaker, localized);
  }

  function endSession() {
    setSessionActive(false);
    setHandsFree(false);
  }
  function newSession() {
    setMessages([]);
    setPictogramHistory([]);
    setActivePictogram(null);
    setSessionActive(true);
    setLatencyMs(null);
    const greeting = staffLang === "de"
      ? "Guten Tag, was kann ich für Sie tun?"
      : mockTranslate("Guten Tag, was kann ich für Sie tun?", "de", staffLang);
    pushMessage("staff", greeting, staffLang, patientLang);
  }

  const lexiconResults = useMemo(() => {
    const q = lexiconQuery.trim().toLowerCase();
    if (!q) return [];
    return lexicon
      .filter(
        (e) =>
          e.keywords.some((k) => k.toLowerCase().includes(q)) ||
          Object.values(e.translations).some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [lexiconQuery, lexicon]);

  const staffLangObj = LANGUAGES.find((l) => l.code === staffLang);
  const patientLangObj = LANGUAGES.find((l) => l.code === patientLang);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* ============== HEADER ============== */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-sky-700" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight leading-none">SwissMedPreter</h1>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-none">Quality care without language barriers</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[11px] font-medium text-emerald-800">On-Premises · FADP/GDPR</span>
          </div>

          <div className="flex-1" />

          {/* Status pills */}
          <div className="flex items-center gap-2 text-xs">
            {(() => {
              const engineId = backendOnline ? (lastEngine || engineInfo?.primary || "phrasebook") : "mock";
              const meta = ENGINE_LABELS[engineId] || ENGINE_LABELS.mock;
              const toneClasses = {
                emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
                sky: "bg-sky-50 text-sky-800 border-sky-100",
                amber: "bg-amber-50 text-amber-800 border-amber-100",
                slate: "bg-slate-100 text-slate-700 border-slate-200",
              }[meta.tone];
              const ltSupports = engineInfo?.libretranslate?.supportedLanguages?.length;
              const tooltip = backendOnline
                ? `${meta.hint}${engineId === "libretranslate" && ltSupports ? ` · ${ltSupports} Sprachen` : ""}`
                : "Backend unreachable — using browser mock";
              return (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${toneClasses}`} title={tooltip}>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                  {backendOnline && engineId !== "libretranslate" && engineInfo?.libretranslate?.configured && !engineInfo?.libretranslate?.reachable && (
                    <span className="text-[10px] opacity-70 ml-1">(LibreTranslate offline)</span>
                  )}
                </div>
              );
            })()}
            {latencyMs !== null && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                  latencyMs < 2000 ? "bg-sky-50 text-sky-800" : "bg-amber-50 text-amber-800"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Latency {latencyMs} ms</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              <span className="font-mono">{CASE_NUMBER}</span>
            </div>
          </div>
        </div>

        {/* Sub-bar: language + controls */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap border-t border-slate-100 bg-slate-50/60">
          <LangPicker label="Staff speaks" value={staffLang} onChange={setStaffLang} accent="sky" />
          <span className="text-slate-300 select-none">↔</span>
          <LangPicker label="Patient speaks" value={patientLang} onChange={setPatientLang} accent="violet" />

          <div className="flex-1" />

          <Toggle checked={handsFree} onChange={setHandsFree} label="Hands-free" />
          <Toggle checked={emergencyMode} onChange={setEmergencyMode} label="Emergency mode" accent="amber" />

          {sessionActive ? (
            <Btn variant="outline" size="sm" onClick={endSession}>
              <X className="w-3.5 h-3.5" /> End session
            </Btn>
          ) : (
            <Btn variant="primary" size="sm" onClick={newSession}>
              <Play className="w-3.5 h-3.5" /> New session
            </Btn>
          )}
        </div>

        {emergencyMode && (
          <div className="bg-amber-50 border-t border-amber-200 text-amber-900 px-4 sm:px-6 py-1.5 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Emergency mode: hands-free triage, prioritised translation queue.
          </div>
        )}
      </header>

      {/* ============== MAIN ============== */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Conversation column */}
        <section className="space-y-4">
          {/* Speaker buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SpeakerCard
              role="staff"
              icon={<Stethoscope className="w-4 h-4" />}
              title="Healthcare Professional"
              lang={staffLangObj}
              onSubmit={(text) => submit("staff", text)}
              disabled={!sessionActive}
            />
            <SpeakerCard
              role="patient"
              icon={<User className="w-4 h-4" />}
              title="Patient / Care Recipient"
              lang={patientLangObj}
              onSubmit={(text) => submit("patient", text)}
              disabled={!sessionActive}
            />
          </div>

          {/* Demo helpers: drop a random sample utterance into the transcript */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Demo:</span>
            <Btn variant="ghost" size="sm" onClick={() => sampleAs("staff")} disabled={!sessionActive}>
              <Stethoscope className="w-3.5 h-3.5" /> Staff phrase
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => sampleAs("patient")} disabled={!sessionActive}>
              <User className="w-3.5 h-3.5" /> Patient phrase
            </Btn>
          </div>

          {/* Transcript */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${sessionActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                <span className="text-xs font-medium text-slate-700">Live transcript</span>
                <span className="text-[11px] text-slate-400">· {messages.length} turns</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Audio output enabled
              </div>
            </div>

            <div className="px-4 py-4 max-h-[480px] overflow-y-auto space-y-3 bg-gradient-to-b from-white to-slate-50/40">
              {messages.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No conversation yet. Tap the speaker buttons above to start.
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} onPictogram={(t) => setActivePictogram(t)} />
              ))}
              {pendingTranslation && (
                <div className="flex items-center gap-2 px-2 text-xs text-slate-500 italic">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  Translating on local LLM…
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </section>

        {/* ============== SIDE PANEL ============== */}
        <aside className="space-y-4">
          {/* Active pictogram */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-sky-700" />
                <span className="text-xs font-medium text-slate-700">Visual aid</span>
              </div>
              <span className="text-[11px] text-slate-400">Auto-detected</span>
            </div>
            <div className="p-5">
              {activePictogram ? (
                <div className="text-center">
                  <div className="w-52 h-52 mx-auto rounded-2xl bg-gradient-to-br from-sky-50 via-white to-sky-50 border border-sky-100 shadow-inner flex items-center justify-center text-sky-800 p-7">
                    <Pictogram id={activePictogram.pictogram} className="w-full h-full" />
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="text-lg font-semibold text-slate-900">
                      {activePictogram.translations[staffLang] || activePictogram.translations.en}
                    </div>
                    <div
                      className="text-lg text-slate-700"
                      dir={LANGUAGES.find((l) => l.code === patientLang)?.rtl ? "rtl" : "ltr"}
                    >
                      {activePictogram.translations[patientLang] || activePictogram.translations.en}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide pt-2">
                      Term · {activePictogram.id} · {activePictogram.category || "general"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-12">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                    <Languages className="w-8 h-8" />
                  </div>
                  No keyword detected yet. Pictograms appear automatically when medical terms are spoken.
                </div>
              )}
            </div>

            {pictogramHistory.length > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 mb-2 uppercase tracking-wide">Recent in this session</div>
                <div className="flex flex-wrap gap-1.5">
                  {pictogramHistory.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePictogram(p)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border transition ${
                        activePictogram?.id === p.id
                          ? "border-sky-300 bg-sky-50 text-sky-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 inline-block text-slate-600">
                        <Pictogram id={p.pictogram} />
                      </span>
                      {p.translations[staffLang] || p.translations.en}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lexicon search (offline fallback) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">Offline lexicon</span>
              </div>
              <span className="text-[11px] text-slate-400">{lexicon.length} terms</span>
            </div>
            <div className="p-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={lexiconQuery}
                  onChange={(e) => setLexiconQuery(e.target.value)}
                  placeholder="Search 'pain', 'wrist', 'دواء'…"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div className="mt-2 max-h-[260px] overflow-y-auto -mx-1">
                {(lexiconQuery ? lexiconResults : lexicon).map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setActivePictogram(entry);
                      setPictogramHistory((p) => {
                        const next = [entry, ...p.filter((e) => e.id !== entry.id)];
                        return next.slice(0, 6);
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition ${
                      activePictogram?.id === entry.id ? "bg-sky-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-10 h-10 flex-shrink-0 rounded-md bg-gradient-to-br from-sky-50 to-white border border-slate-100 text-sky-800 flex items-center justify-center p-1.5">
                      <Pictogram id={entry.pictogram} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-900 block truncate">
                        {entry.translations[staffLang] || entry.translations.en}
                      </span>
                      <span
                        className="text-xs text-slate-500 block truncate"
                        dir={LANGUAGES.find((l) => l.code === patientLang)?.rtl ? "rtl" : "ltr"}
                      >
                        {entry.translations[patientLang] || entry.translations.en}
                      </span>
                    </span>
                  </button>
                ))}
                {lexiconQuery && lexiconResults.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-4">No matches.</div>
                )}
              </div>
            </div>
          </div>

          {/* Compliance footer */}
          <div className="text-[11px] text-slate-400 leading-relaxed px-1">
            All audio, transcripts, and translations are processed inside the hospital network. No data leaves the perimeter.
            Audit log entries are persisted to the KIS under the active case number.
          </div>
        </aside>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------
   7. Sub-components
   ------------------------------------------------------------------------- */
function LangPicker({ label, value, onChange, accent = "sky" }) {
  const dotColor = accent === "violet" ? "bg-violet-500" : "bg-sky-500";
  return (
    <label className="flex items-center gap-2 group">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="text-xs text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-medium bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function SpeakerCard({ role, icon, title, lang, onSubmit, disabled }) {
  const [text, setText] = useState("");
  const { supported, listening, interim, start, stop } = useSpeechRecognition({
    lang: lang?.code,
    onFinal: (transcript) => {
      // Final transcript: immediately submit so the conversation flows naturally.
      onSubmit(transcript);
    },
  });

  const accent =
    role === "staff"
      ? "from-sky-50 to-white border-sky-100"
      : "from-violet-50 to-white border-violet-100";
  const accentText = role === "staff" ? "text-sky-800" : "text-violet-800";
  const accentBg = role === "staff" ? "bg-sky-600 hover:bg-sky-700" : "bg-violet-600 hover:bg-violet-700";
  const accentRing = role === "staff" ? "focus-within:ring-sky-200 focus-within:border-sky-300" : "focus-within:ring-violet-200 focus-within:border-violet-300";

  function submitText() {
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
    setText("");
  }

  function onMicClick() {
    if (!supported) return;
    if (listening) stop();
    else start();
  }

  const placeholder = role === "staff"
    ? "Frage oder Anweisung tippen…"
    : "Beschwerden eingeben…";

  return (
    <div className={`bg-gradient-to-br ${accent} border rounded-xl p-3.5 flex flex-col gap-2.5`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-md bg-white border border-current/10 flex items-center justify-center ${accentText}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${accentText}`}>{title}</div>
          <div className="text-[11px] text-slate-500 truncate">
            speaks <span className="font-medium text-slate-700">{lang?.flag} {lang?.name}</span>
            <span className="ml-2 text-slate-400">· {bcp47(lang?.code)}</span>
          </div>
        </div>
      </div>

      {/* Text input + send */}
      <div className={`flex items-stretch gap-1.5 bg-white border border-slate-200 rounded-md p-1 transition focus-within:ring-2 ${accentRing}`}>
        <input
          value={listening ? interim : text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submitText(); }}
          placeholder={listening ? "Höre zu…" : placeholder}
          disabled={disabled || listening}
          dir={lang?.rtl ? "rtl" : "ltr"}
          className="flex-1 px-2 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400 disabled:opacity-60"
        />
        <button
          disabled={disabled || !text.trim() || listening}
          onClick={submitText}
          title="Send (Enter)"
          className={`text-white rounded px-2.5 flex items-center justify-center transition ${accentBg} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Mic button */}
      <button
        disabled={disabled || !supported}
        onClick={onMicClick}
        title={supported ? (listening ? "Tap to stop listening" : "Tap to speak") : "Speech recognition not supported in this browser"}
        className={`text-white text-sm font-medium rounded-md py-2 flex items-center justify-center gap-2 transition ${
          listening ? "bg-rose-600 hover:bg-rose-700 animate-pulse" : accentBg
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {listening ? <><Square className="w-4 h-4" /> Stop listening</> : <><Mic className="w-4 h-4" /> Tap to speak</>}
      </button>

      {!supported && (
        <div className="text-[10px] text-slate-500 leading-snug flex items-start gap-1 -mt-1">
          <Keyboard className="w-3 h-3 mt-0.5 flex-shrink-0" />
          Speech recognition unavailable in this browser. Use the text input — Chrome / Edge support voice.
        </div>
      )}
    </div>
  );
}

function MessageBubble({ m, onPictogram }) {
  const isStaff = m.speaker === "staff";
  const sourceLangObj = LANGUAGES.find((l) => l.code === m.sourceLang);
  const targetLangObj = LANGUAGES.find((l) => l.code === m.targetLang);
  const isUntranslated =
    m.status === "done" &&
    m.sourceLang !== m.targetLang &&
    typeof m.translation === "string" &&
    m.translation.trim().toLowerCase() === (m.original || "").trim().toLowerCase();
  const translationTint = isStaff
    ? "border-violet-300 bg-violet-50"
    : "border-sky-300 bg-sky-50";
  const translationHeader = isStaff
    ? "bg-violet-100 text-violet-900 border-violet-200"
    : "bg-sky-100 text-sky-900 border-sky-200";
  const translationBadge = isStaff
    ? "bg-violet-600 text-white"
    : "bg-sky-600 text-white";
  return (
    <div className={`flex ${isStaff ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[88%] w-full ${isStaff ? "" : "ml-auto"}`}>
        {/* Speaker header */}
        <div className={`flex items-center gap-2 mb-1 text-[11px] text-slate-500 ${isStaff ? "" : "justify-end"}`}>
          {isStaff ? (
            <>
              <Stethoscope className="w-3 h-3 text-sky-700" /> <span className="font-medium text-sky-800">Staff</span>
            </>
          ) : (
            <>
              <User className="w-3 h-3 text-violet-700" /> <span className="font-medium text-violet-800">Patient</span>
            </>
          )}
          <span className="text-slate-300">·</span>
          <span>{m.time.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}</span>
          {m.terms.length > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 flex-wrap">
                {m.terms.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onPictogram(t)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100 transition"
                  >
                    <span className="w-3 h-3 inline-block">
                      <Pictogram id={t.pictogram} />
                    </span>
                    {t.id}
                  </button>
                ))}
              </span>
            </>
          )}
        </div>

        {/* Original card */}
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-semibold uppercase tracking-wider">
                Original
              </span>
              <span className="text-slate-600 font-medium">{sourceLangObj?.flag} {sourceLangObj?.name}</span>
            </div>
            <span className="text-slate-400 uppercase tracking-wider">Eingabe</span>
          </div>
          <div
            className="px-4 py-2.5 text-sm leading-relaxed text-slate-900"
            dir={sourceLangObj?.rtl ? "rtl" : "ltr"}
          >
            {highlightTerms(m.original, m.terms, m.sourceLang)}
          </div>
        </div>

        {/* Arrow connector */}
        <div className="flex items-center justify-center py-1 text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Translation card */}
        <div className={`rounded-xl overflow-hidden border-2 shadow-sm ${translationTint}`}>
          <div className={`px-3 py-1.5 border-b flex items-center justify-between text-[10px] ${translationHeader}`}>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${translationBadge}`}>
                Übersetzung
              </span>
              <span className="font-medium">{targetLangObj?.flag} {targetLangObj?.name}</span>
            </div>
            <span className="uppercase tracking-wider opacity-70 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" /> Output
              {m.engine && ENGINE_LABELS[m.engine] && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-white/40 normal-case tracking-normal font-medium opacity-90" title={ENGINE_LABELS[m.engine].hint}>
                  via {ENGINE_LABELS[m.engine].label}
                </span>
              )}
            </span>
          </div>
          <div className="px-4 py-2.5">
            {m.status === "translating" ? (
              <div className="flex items-center gap-1.5 py-0.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: "300ms" }} />
                <span className="ml-1.5 text-[11px] italic">Übersetzung läuft…</span>
              </div>
            ) : isUntranslated ? (
              <div className="flex items-start gap-2 text-amber-800 bg-amber-50 -mx-4 -my-2.5 px-4 py-2.5 border-l-4 border-amber-300">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  <div className="font-medium">Keine Übersetzung im Demo-Phrasenbuch.</div>
                  <div className="opacity-80">
                    Im Prototyp werden nur bekannte medizinische Sätze und Fachbegriffe übersetzt. Originaltext:
                  </div>
                  <div className="mt-1 text-slate-700 italic" dir={targetLangObj?.rtl ? "rtl" : "ltr"}>
                    {m.translation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed text-slate-900" dir={targetLangObj?.rtl ? "rtl" : "ltr"}>
                {m.translation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function highlightTerms(text, terms, sourceLang) {
  if (!terms || terms.length === 0) return text;
  const tokens = [];
  for (const t of terms) {
    const word = t.translations[sourceLang];
    if (word) tokens.push(word);
    for (const k of t.keywords) tokens.push(k);
  }
  if (tokens.length === 0) return text;
  // Build a regex to highlight any token (case-insensitive)
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${tokens.map(escape).join("|")})`, "gi");
  const parts = text.split(re);
  const lowerTokens = new Set(tokens.map((t) => t.toLowerCase()));
  return parts.map((p, i) => {
    if (p && lowerTokens.has(p.toLowerCase())) {
      return (
        <span key={i} className="bg-amber-100 text-amber-900 px-0.5 rounded font-medium">
          {p}
        </span>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}
