import React, { useEffect, useRef } from 'react';

const MEDICAL_KEYWORDS = [
  'kopf', 'handgelenk', 'herz', 'knie', 'schmerzen', 'fieber',
  'blutdruck', 'diagnose', 'medikament', 'behandlung', 'symptom',
  'allergie', 'infekt', 'wunde', 'fraktur', 'blutung',
];

function highlightMedicalTerms(text) {
  let result = text;
  MEDICAL_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, (match) => `__KEYWORD__${match}__ENDKEYWORD__`);
  });
  return result;
}

function renderTextWithHighlights(text) {
  const parts = text.split(/(__KEYWORD__.*?__ENDKEYWORD__)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('__KEYWORD__')) {
      const keyword = part.replace('__KEYWORD__', '').replace('__ENDKEYWORD__', '');
      return (
        <span key={idx} className="medical-keyword">
          {keyword}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function TranscriptPanel({ messages = [] }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-6 bg-white">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-center">
            <span className="block text-lg font-semibold mb-2">No messages yet</span>
            <span className="text-sm">Start a conversation to see translations here</span>
          </p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'patient' ? 'justify-start' : 'justify-end'} gap-2`}
          >
            <div
              className={`max-w-md rounded-lg px-4 py-3 shadow-sm ${
                msg.role === 'patient'
                  ? 'bg-blue-50 border border-blue-200 text-gray-900'
                  : 'bg-green-50 border border-green-200 text-gray-900'
              }`}
            >
              <div className="text-xs font-semibold text-gray-600 mb-1">
                {msg.role === 'patient' ? 'Patient' : 'Staff'} · {msg.language.toUpperCase()}
              </div>
              <div className="text-sm leading-relaxed">
                {renderTextWithHighlights(highlightMedicalTerms(msg.text))}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-right">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
