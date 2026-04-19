import React, { useState, useEffect } from 'react';

const FALLBACK_LANGUAGES = [
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'zh', name: 'Chinese Simplified (简体中文)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'ti', name: 'Tigrinya (ትግርኛ)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polish (Polski)' },
];

export default function LanguageSelector({ selectedLanguage, onLanguageChange }) {
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/languages', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setLanguages(data);
          }
        }
      } catch (error) {
        console.log('Using fallback languages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="language-select" className="text-sm font-semibold text-gray-700">
        Patient Language
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={isLoading}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 min-w-48"
      >
        <option value="">Select Language...</option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
