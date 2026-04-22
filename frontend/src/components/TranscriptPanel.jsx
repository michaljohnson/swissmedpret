import React, { useEffect, useRef } from 'react';

function PatientIcon() {
  return (
    <img src="/icon-patient.svg" alt="Patient" width="36" height="36" className="rounded-full" />
  );
}

function StaffIcon() {
  return (
    <img src="/icon-staff.svg" alt="Staff" width="36" height="36" className="rounded-full" />
  );
}

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
    <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-4 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 py-20">
            <p className="text-center">
              <span className="block text-lg font-semibold mb-2">Noch keine Nachrichten</span>
              <span className="text-sm">Nachricht eingeben um die Übersetzung zu starten</span>
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${msg.role === 'patient' ? 'justify-start' : 'justify-end'}`}
            >
              {msg.role === 'patient' && (
                <div className="flex-shrink-0 mb-1">
                  <PatientIcon />
                </div>
              )}
              <div
                className={`max-w-sm rounded-2xl px-4 py-2 shadow-sm ${
                  msg.role === 'patient'
                    ? 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    : 'bg-blue-500 text-white rounded-br-sm'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  msg.role === 'patient' ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {msg.role === 'patient' ? 'Patient' : 'Staff'} · {msg.language.toUpperCase()}
                </div>
                <div className="text-sm leading-relaxed">
                  {renderTextWithHighlights(highlightMedicalTerms(msg.text))}
                </div>
                <div className={`text-xs mt-1 text-right ${
                  msg.role === 'patient' ? 'text-gray-400' : 'text-blue-200'
                }`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
              {msg.role === 'staff' && (
                <div className="flex-shrink-0 mb-1">
                  <StaffIcon />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
