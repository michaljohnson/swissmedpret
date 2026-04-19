import React from 'react';

const PICTOGRAMS = {
  handgelenk: {
    name: 'Handgelenk',
    de: 'Handgelenk',
    ar: 'المعصم',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="20" r="8" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <line x1="50" y1="28" x2="50" y2="55" stroke="#3b82f6" strokeWidth="2" />
        <line x1="35" y1="32" x2="15" y2="25" stroke="#3b82f6" strokeWidth="2" />
        <line x1="65" y1="32" x2="85" y2="25" stroke="#3b82f6" strokeWidth="2" />
        <line x1="35" y1="35" x2="20" y2="45" stroke="#3b82f6" strokeWidth="2" />
        <line x1="65" y1="35" x2="80" y2="45" stroke="#3b82f6" strokeWidth="2" />
        <rect x="40" y="55" width="20" height="25" fill="none" stroke="#3b82f6" strokeWidth="2" rx="2" />
        <circle cx="45" cy="58" r="2" fill="#3b82f6" />
        <circle cx="55" cy="58" r="2" fill="#3b82f6" />
      </svg>
    ),
  },
  kopf: {
    name: 'Kopf',
    de: 'Kopf',
    ar: 'الرأس',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="35" r="22" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="42" cy="32" r="3" fill="#3b82f6" />
        <circle cx="58" cy="32" r="3" fill="#3b82f6" />
        <path d="M 45 42 Q 50 46 55 42" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <path d="M 35 55 Q 50 65 65 55" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <line x1="30" y1="40" x2="20" y2="38" stroke="#3b82f6" strokeWidth="2" />
        <line x1="70" y1="40" x2="80" y2="38" stroke="#3b82f6" strokeWidth="2" />
      </svg>
    ),
  },
  herz: {
    name: 'Herz',
    de: 'Herz',
    ar: 'القلب',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M 50 85 C 30 70 15 55 15 40 C 15 28 23 20 32 20 C 40 20 48 26 50 35 C 52 26 60 20 68 20 C 77 20 85 28 85 40 C 85 55 70 70 50 85 Z"
              fill="none" stroke="#3b82f6" strokeWidth="2" />
      </svg>
    ),
  },
  knie: {
    name: 'Knie',
    de: 'Knie',
    ar: 'الركبة',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <line x1="50" y1="10" x2="50" y2="40" stroke="#3b82f6" strokeWidth="3" />
        <rect x="35" y="40" width="30" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" rx="2" />
        <circle cx="42" cy="50" r="2" fill="#3b82f6" />
        <circle cx="58" cy="50" r="2" fill="#3b82f6" />
        <line x1="50" y1="60" x2="50" y2="90" stroke="#3b82f6" strokeWidth="3" />
      </svg>
    ),
  },
  schmerzen: {
    name: 'Schmerzen',
    de: 'Schmerzen',
    ar: 'الألم',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="50" r="30" fill="none" stroke="#ef4444" strokeWidth="2" />
        <path d="M 50 20 L 55 35 L 70 35 L 60 45 L 65 60 L 50 50 L 35 60 L 40 45 L 30 35 L 45 35 Z" fill="none" stroke="#ef4444" strokeWidth="2" />
      </svg>
    ),
  },
  fieber: {
    name: 'Fieber',
    de: 'Fieber',
    ar: 'الحمى',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="35" y="20" width="30" height="50" fill="none" stroke="#3b82f6" strokeWidth="2" rx="3" />
        <circle cx="50" cy="65" r="8" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <rect x="40" y="40" width="20" height="20" fill="#ef4444" rx="2" />
      </svg>
    ),
  },
};

export function Pictogram({ keyword, targetLanguage = 'de' }) {
  const pictogram = PICTOGRAMS[keyword.toLowerCase().replace(/ä|ö|ü|ß/g, (match) => {
    const map = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
    return map[match];
  })];

  if (!pictogram) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="w-32 h-32 mb-3">{pictogram.svg}</div>
      <p className="text-sm font-semibold text-gray-900">{pictogram.de}</p>
      <p className="text-xs text-gray-600">{pictogram.ar}</p>
    </div>
  );
}

export default Pictogram;
