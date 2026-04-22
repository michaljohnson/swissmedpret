import React from 'react';

const PICTOGRAMS = {
  handgelenk: {
    de: 'Handgelenk', en: 'Wrist', es: 'Muñeca', fr: 'Poignet', it: 'Polso', ja: '手首',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="10" x2="50" y2="45" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="50" cy="50" rx="18" ry="8" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2"/>
        <line x1="50" y1="55" x2="50" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="70" x2="38" y2="85" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="70" x2="44" y2="88" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="70" x2="50" y2="90" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="70" x2="56" y2="88" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="70" x2="62" y2="85" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  kopf: {
    de: 'Kopf', en: 'Head', es: 'Cabeza', fr: 'Tête', it: 'Testa', ja: '頭',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="40" r="28" fill="none" stroke="#3b82f6" strokeWidth="2.5"/>
        <circle cx="40" cy="35" r="3" fill="#3b82f6"/>
        <circle cx="60" cy="35" r="3" fill="#3b82f6"/>
        <path d="M 43 48 Q 50 54 57 48" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="50" y1="68" x2="50" y2="85" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  herz: {
    de: 'Herz', en: 'Heart', es: 'Corazón', fr: 'Cœur', it: 'Cuore', ja: '心臓',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 82 C 25 65 10 50 10 35 C 10 22 20 14 30 14 C 40 14 48 22 50 30 C 52 22 60 14 70 14 C 80 14 90 22 90 35 C 90 50 75 65 50 82 Z"
              fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5"/>
        <path d="M 30 45 L 40 45 L 45 35 L 50 55 L 55 40 L 60 45 L 70 45" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  knie: {
    de: 'Knie', en: 'Knee', es: 'Rodilla', fr: 'Genou', it: 'Ginocchio', ja: '膝',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="8" x2="50" y2="38" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="50" cy="50" r="14" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5"/>
        <circle cx="50" cy="50" r="5" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2"/>
        <line x1="50" y1="64" x2="50" y2="92" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
  },
  ruecken: {
    de: 'Rücken', en: 'Back', es: 'Espalda', fr: 'Dos', it: 'Schiena', ja: '背中',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="15" r="8" fill="none" stroke="#3b82f6" strokeWidth="2"/>
        <path d="M 50 23 C 50 23 48 40 46 50 C 44 60 48 75 50 80" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <line x1="35" y1="30" x2="50" y2="28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="65" y1="30" x2="50" y2="28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="48" cy="50" rx="12" ry="8" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"/>
        <line x1="42" y1="80" x2="35" y2="95" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="50" y1="80" x2="58" y2="95" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  schulter: {
    de: 'Schulter', en: 'Shoulder', es: 'Hombro', fr: 'Épaule', it: 'Spalla', ja: '肩',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="20" r="10" fill="none" stroke="#3b82f6" strokeWidth="2"/>
        <line x1="50" y1="30" x2="50" y2="65" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 50 35 Q 30 30 20 45" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M 50 35 Q 70 30 80 45" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="35" cy="35" r="8" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"/>
      </svg>
    ),
  },
  bauch: {
    de: 'Bauch', en: 'Stomach', es: 'Estómago', fr: 'Ventre', it: 'Stomaco', ja: '腹',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="15" r="8" fill="none" stroke="#3b82f6" strokeWidth="2"/>
        <line x1="50" y1="23" x2="50" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="35" y1="32" x2="20" y2="50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="65" y1="32" x2="80" y2="50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="50" cy="52" rx="16" ry="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
        <line x1="42" y1="70" x2="35" y2="90" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="58" y1="70" x2="65" y2="90" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  brust: {
    de: 'Brust', en: 'Chest', es: 'Pecho', fr: 'Poitrine', it: 'Petto', ja: '胸',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="15" r="8" fill="none" stroke="#3b82f6" strokeWidth="2"/>
        <line x1="50" y1="23" x2="50" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="35" y1="32" x2="20" y2="50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="65" y1="32" x2="80" y2="50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <rect x="32" y="30" width="36" height="22" rx="4" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"/>
        <line x1="42" y1="70" x2="35" y2="90" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="58" y1="70" x2="65" y2="90" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  arm: {
    de: 'Arm', en: 'Arm', es: 'Brazo', fr: 'Bras', it: 'Braccio', ja: '腕',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="20" r="3" fill="#3b82f6"/>
        <line x1="30" y1="23" x2="30" y2="40" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30" y1="30" x2="75" y2="25" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="52" cy="27" r="6" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2"/>
        <line x1="75" y1="25" x2="85" y2="40" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="85" y1="40" x2="82" y2="50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="85" y1="40" x2="88" y2="50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="85" y1="40" x2="91" y2="48" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  fuss: {
    de: 'Fuss', en: 'Foot', es: 'Pie', fr: 'Pied', it: 'Piede', ja: '足',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="10" x2="40" y2="50" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
        <path d="M 25 50 Q 25 75 40 75 L 75 75 Q 80 75 80 70 Q 80 60 70 58 L 40 50" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="72" cy="68" r="3" fill="#3b82f6" opacity="0.4"/>
        <circle cx="65" cy="64" r="2.5" fill="#3b82f6" opacity="0.4"/>
        <circle cx="58" cy="62" r="2.5" fill="#3b82f6" opacity="0.4"/>
      </svg>
    ),
  },
};

// Map terms in all languages to German keys — ONLY body parts
const TERM_ALIASES = {
  // German
  'handgelenk': 'handgelenk', 'kopf': 'kopf', 'herz': 'herz', 'knie': 'knie',
  'rücken': 'ruecken', 'ruecken': 'ruecken', 'schulter': 'schulter',
  'bauch': 'bauch', 'brust': 'brust', 'arm': 'arm', 'fuss': 'fuss', 'fuß': 'fuss',
  // English
  'wrist': 'handgelenk', 'head': 'kopf', 'heart': 'herz', 'knee': 'knie',
  'back': 'ruecken', 'shoulder': 'schulter', 'stomach': 'bauch',
  'chest': 'brust', 'foot': 'fuss',
  // Spanish
  'muñeca': 'handgelenk', 'cabeza': 'kopf', 'corazón': 'herz', 'rodilla': 'knie',
  'espalda': 'ruecken', 'hombro': 'schulter', 'estómago': 'bauch',
  'pecho': 'brust', 'brazo': 'arm', 'pie': 'fuss',
  // French
  'poignet': 'handgelenk', 'tête': 'kopf', 'cœur': 'herz', 'genou': 'knie',
  'dos': 'ruecken', 'épaule': 'schulter', 'ventre': 'bauch',
  'poitrine': 'brust', 'bras': 'arm', 'pied': 'fuss',
  // Italian
  'polso': 'handgelenk', 'testa': 'kopf', 'cuore': 'herz', 'ginocchio': 'knie',
  'schiena': 'ruecken', 'spalla': 'schulter', 'stomaco': 'bauch',
  'petto': 'brust', 'braccio': 'arm', 'piede': 'fuss',
  // Japanese
  '手首': 'handgelenk', '頭': 'kopf', '心臓': 'herz', '膝': 'knie',
  '背中': 'ruecken', '肩': 'schulter', '腹': 'bauch',
  '胸': 'brust', '腕': 'arm', '足': 'fuss',
};

export function lookupTerm(word) {
  const key = TERM_ALIASES[word.toLowerCase()];
  return key ? PICTOGRAMS[key] : null;
}

export function getAllTerms() {
  return Object.keys(TERM_ALIASES);
}

export default function MedicalTermDialog({ term, onClose }) {
  const pictogram = lookupTerm(term);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!pictogram) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255,255,255,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full mx-4 border border-gray-200" aria-label="Medical term details" onClick={(e) => e.stopPropagation()}>
        {/* Pictogram */}
        <div className="w-40 h-40 mx-auto mb-4">
          {pictogram.svg}
        </div>

        {/* Translations */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{pictogram.de}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-500">EN</span>
              <p className="font-medium text-gray-900">{pictogram.en}</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-500">ES</span>
              <p className="font-medium text-gray-900">{pictogram.es}</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-500">FR</span>
              <p className="font-medium text-gray-900">{pictogram.fr}</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-500">IT</span>
              <p className="font-medium text-gray-900">{pictogram.it}</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-3 py-1.5 col-span-2">
              <span className="text-xs text-gray-500">JA</span>
              <p className="font-medium text-gray-900">{pictogram.ja}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          Schliessen
        </button>
      </div>
    </div>
  );
}
