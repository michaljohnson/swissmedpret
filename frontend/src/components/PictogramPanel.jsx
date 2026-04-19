import React, { useState, useEffect } from 'react';
import { Pictogram } from './MedicalPictograms';

export default function PictogramPanel({ keywords = [], targetLanguage = 'de', isVisible = false }) {
  const [lexiconData, setLexiconData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!keywords || keywords.length === 0) return;

    const fetchLexicon = async () => {
      setIsLoading(true);
      const newData = {};

      for (const keyword of keywords) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/lexicon/search?term=${encodeURIComponent(keyword)}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
          );
          if (response.ok) {
            const data = await response.json();
            newData[keyword] = data;
          }
        } catch (error) {
          console.log(`Could not fetch lexicon for ${keyword}:`, error);
        }
      }

      setLexiconData(newData);
      setIsLoading(false);
    };

    fetchLexicon();
  }, [keywords]);

  if (!isVisible || !keywords || keywords.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 shadow-xl z-40 transform transition-transform duration-300"
         style={{ transform: isVisible ? 'translateX(0)' : 'translateX(100%)' }}>
      <div className="h-full overflow-y-auto p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Medical Terms</h2>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        )}

        <div className="space-y-4">
          {keywords.map((keyword, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <Pictogram keyword={keyword} targetLanguage={targetLanguage} />
              {lexiconData[keyword] && (
                <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                  {lexiconData[keyword].definition && (
                    <p className="text-gray-700">{lexiconData[keyword].definition}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
