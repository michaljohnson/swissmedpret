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
          <path {...common} d="M22 50c0-6 2-10 6-12V18c0-2 2-4 4-4s4 2 4 4v18" />
          <path {...common} d="M36 28c0-2 2-4 4-4s4 2 4 4v12" />
          <path {...common} d="M44 32c0-2 2-3 3-3s3 1 3 3v10c0 6-4 12-12 12h-8c-4 0-6-2-8-4" />
          <path {...common} d="M22 46l-4-4" strokeWidth="2.5" />
          <path {...common} d="M18 50l-4-4" strokeWidth="2.5" />
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
          <path {...common} d="M32 50C16 38 12 28 18 22c4-4 10-4 14 2 4-6 10-6 14-2 6 6 2 16-14 28z" />
          <path {...common} d="M22 30h6l3-4 3 8 3-4h7" />
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
          <path {...common} d="M32 12c0 0 -14 18 -14 28a14 14 0 0 0 28 0c0-10 -14-28 -14-28z" />
          <path {...common} d="M26 36c0 4 2 6 4 6" />
        </svg>
      );
    case "pain":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="pain">
          <path {...common} d="M32 14v6M32 44v6M14 32h6M44 32h6M19 19l4 4M41 41l4 4M19 45l4-4M41 23l4-4" />
          <circle cx="32" cy="32" r="8" {...common} />
          <path {...common} d="M28 32l4-4 4 4-4 4z" />
        </svg>
      );
    case "fever":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="fever">
          <rect x="28" y="12" width="8" height="32" rx="4" {...common} />
          <circle cx="32" cy="48" r="6" {...common} />
          <path {...common} d="M32 18v22" />
          <path {...common} d="M44 20l4-2M44 28l4 0M44 36l4 2" />
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
          <rect x="18" y="22" width="28" height="20" rx="10" {...common} />
          <path {...common} d="M32 22v20" />
          <circle cx="25" cy="32" r="1.5" fill={stroke} stroke="none" />
          <circle cx="39" cy="32" r="1.5" fill={stroke} stroke="none" />
        </svg>
      );
    case "allergy":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="allergy">
          <circle cx="32" cy="32" r="14" {...common} />
          <circle cx="26" cy="28" r="2" fill={stroke} stroke="none" />
          <circle cx="38" cy="28" r="2" fill={stroke} stroke="none" />
          <circle cx="24" cy="38" r="1.5" fill={stroke} stroke="none" />
          <circle cx="32" cy="40" r="1.5" fill={stroke} stroke="none" />
          <circle cx="40" cy="38" r="1.5" fill={stroke} stroke="none" />
        </svg>
      );
    case "fall":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="fall">
          <circle cx="20" cy="18" r="4" {...common} />
          <path {...common} d="M20 22l4 8 8-2 6 6-4 6" />
          <path {...common} d="M14 50h36" strokeWidth="2" />
          <path {...common} d="M28 30l-6 16" />
        </svg>
      );
    case "breath":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-label="breath">
          <path {...common} d="M14 26c4 0 6-2 8-4 2-2 6-2 8 0 2 2 4 2 6 0 2-2 6-2 8 0 2 2 4 4 8 4" />
          <path {...common} d="M14 38c4 0 6-2 8-4 2-2 6-2 8 0 2 2 4 2 6 0 2-2 6-2 8 0 2 2 4 4 8 4" />
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

// Detect lexicon hits from a piece of text
function detectKeywords(text, langCode) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const entry of LEXICON) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        hits.push(entry);
        break;
      }
    }
    // Also check translation in current language
    const t = entry.translations[langCode];
    if (t && lower.includes(t.toLowerCase()) && !hits.includes(entry)) {
      hits.push(entry);
    }
  }
  return hits;
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
  const [recording, setRecording] = useState(false);
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
  const transcriptEndRef = useRef(null);

  // Fetch the lexicon from the backend on mount. If the call succeeds we
  // also flip backendOnline=true, which switches translation from the
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Seed: a starter greeting from staff so the screen isn't empty.
  useEffect(() => {
    pushMessage("staff", "Guten Tag, was kann ich für Sie tun?", staffLang, patientLang);
    // eslint-disable-next-line
  }, []);

  // Hands-free auto-trigger: every 6 s alternate a sample patient utterance
  useEffect(() => {
    if (!handsFree || !sessionActive) return;
    const t = setInterval(() => {
      const sample = SAMPLE_PHRASES.patient[Math.floor(Math.random() * SAMPLE_PHRASES.patient.length)];
      pushMessage("patient", sample.content, "de", staffLang); // patient speaks in their own; demo uses DE
    }, 6500);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [handsFree, sessionActive, staffLang]);

  function promotePictogram(entry) {
    if (!entry) return;
    setActivePictogram(entry);
    setPictogramHistory((p) => {
      const next = [entry, ...p.filter((e) => e.id !== entry.id)];
      return next.slice(0, 6);
    });
  }

  function finishMessage(id, translation, terms, latency) {
    setLatencyMs(latency);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, translation, status: "done", terms: terms.length ? terms : m.terms }
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
          finishMessage(id, data.translation ?? text, detected, elapsed);
        })
        .catch(() => {
          // Backend hiccup: degrade to local mock so the UX stays alive.
          const translated = mockTranslate(text, sourceLang, targetLang);
          finishMessage(id, translated, initialTerms, Math.round(performance.now() - start));
        });
    } else {
      const delay = 700 + Math.random() * 700; // 700-1400 ms — matches backend latency budget
      setTimeout(() => {
        const translated = mockTranslate(text, sourceLang, targetLang);
        finishMessage(id, translated, initialTerms, Math.round(performance.now() - start));
      }, delay);
    }
  }

  function speakAs(speaker) {
    if (!sessionActive) return;
    const pool = speaker === "staff" ? SAMPLE_PHRASES.staff : SAMPLE_PHRASES.patient;
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    const text = speaker === "staff" ? phrase.de : phrase.content;
    const src = speaker === "staff" ? staffLang : "de"; // demo: patient speaks in DE for clarity
    const tgt = speaker === "staff" ? patientLang : staffLang;
    pushMessage(speaker, text, src, tgt);
  }

  function endSession() {
    setSessionActive(false);
    setRecording(false);
    setHandsFree(false);
  }
  function newSession() {
    setMessages([]);
    setPictogramHistory([]);
    setActivePictogram(null);
    setSessionActive(true);
    setLatencyMs(null);
    pushMessage("staff", "Guten Tag, was kann ich für Sie tun?", staffLang, patientLang);
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
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                backendOnline
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-slate-100 text-slate-700"
              }`}
              title={backendOnline ? "Connected to on-prem backend" : "Backend unreachable — using local mock"}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{backendOnline ? "Backend online" : "Local mock"}</span>
            </div>
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
          <div className="grid grid-cols-2 gap-3">
            <SpeakerCard
              role="staff"
              icon={<Stethoscope className="w-4 h-4" />}
              title="Healthcare Professional"
              lang={staffLangObj}
              recording={recording}
              onSpeak={() => speakAs("staff")}
              disabled={!sessionActive}
            />
            <SpeakerCard
              role="patient"
              icon={<User className="w-4 h-4" />}
              title="Patient / Care Recipient"
              lang={patientLangObj}
              recording={recording}
              onSpeak={() => speakAs("patient")}
              disabled={!sessionActive}
            />
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
                  <div className="w-32 h-32 mx-auto rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 flex items-center justify-center text-sky-800 p-5">
                    <Pictogram id={activePictogram.pictogram} />
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="text-base font-semibold text-slate-900">
                      {activePictogram.translations[staffLang] || activePictogram.translations.en}
                    </div>
                    <div
                      className="text-base text-slate-700"
                      dir={LANGUAGES.find((l) => l.code === patientLang)?.rtl ? "rtl" : "ltr"}
                    >
                      {activePictogram.translations[patientLang] || activePictogram.translations.en}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide pt-2">
                      Term ID · {activePictogram.id}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-8">
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
                    <span className="w-8 h-8 flex-shrink-0 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center p-1.5">
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

function SpeakerCard({ role, icon, title, lang, recording, onSpeak, disabled }) {
  const accent =
    role === "staff"
      ? "from-sky-50 to-white border-sky-100"
      : "from-violet-50 to-white border-violet-100";
  const accentText = role === "staff" ? "text-sky-800" : "text-violet-800";
  const accentBg = role === "staff" ? "bg-sky-600 hover:bg-sky-700" : "bg-violet-600 hover:bg-violet-700";
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
          </div>
        </div>
      </div>
      <button
        disabled={disabled}
        onClick={onSpeak}
        className={`text-white text-sm font-medium rounded-md py-2 flex items-center justify-center gap-2 transition ${accentBg} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Mic className="w-4 h-4" />
        {recording ? "Listening…" : "Tap to speak"}
      </button>
    </div>
  );
}

function MessageBubble({ m, onPictogram }) {
  const isStaff = m.speaker === "staff";
  const sourceLangObj = LANGUAGES.find((l) => l.code === m.sourceLang);
  const targetLangObj = LANGUAGES.find((l) => l.code === m.targetLang);
  return (
    <div className={`flex ${isStaff ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[88%] ${isStaff ? "" : "text-right"}`}>
        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500">
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
              <span className="inline-flex items-center gap-1">
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
        <div
          className={`rounded-xl px-4 py-2.5 ${
            isStaff
              ? "bg-white border border-slate-200 text-slate-900"
              : "bg-violet-600 text-white border border-violet-600"
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">
            {sourceLangObj?.flag} {sourceLangObj?.name}
          </div>
          <div
            className="text-sm leading-relaxed"
            dir={sourceLangObj?.rtl ? "rtl" : "ltr"}
          >
            {highlightTerms(m.original, m.terms, m.sourceLang)}
          </div>
        </div>
        <div
          className={`mt-1.5 rounded-xl px-4 py-2.5 border-2 border-dashed ${
            isStaff ? "border-violet-200 bg-violet-50/50 text-violet-900" : "border-sky-200 bg-sky-50/50 text-sky-900"
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
            {targetLangObj?.flag} {targetLangObj?.name} · translation
          </div>
          {m.status === "translating" ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className="text-sm leading-relaxed" dir={targetLangObj?.rtl ? "rtl" : "ltr"}>
              {m.translation}
            </div>
          )}
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
