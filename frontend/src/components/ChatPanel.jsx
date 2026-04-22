import React, { useState, useEffect, useRef } from 'react';
import MedicalTermDialog, { getAllTerms, lookupTerm } from './MedicalTermDialog';

const MEDICAL_TERMS = getAllTerms();

function highlightMedicalTerms(text) {
  let result = text;
  MEDICAL_TERMS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, (match) => `__KEYWORD__${match}__ENDKEYWORD__`);
  });
  return result;
}

function renderTextWithHighlights(text, onTermClick) {
  const parts = text.split(/(__KEYWORD__.*?__ENDKEYWORD__)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('__KEYWORD__')) {
      const keyword = part.replace('__KEYWORD__', '').replace('__ENDKEYWORD__', '');
      const hasPictogram = lookupTerm(keyword) !== null;
      return (
        <span
          key={idx}
          onClick={hasPictogram ? (e) => { e.stopPropagation(); onTermClick(keyword); } : undefined}
          className={`bg-red-500 bg-opacity-30 px-1 rounded font-bold ${
            hasPictogram ? 'cursor-pointer hover:bg-opacity-50' : ''
          }`}
        >
          {keyword}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

// Map language codes to BCP-47 speech recognition codes
const SPEECH_LANG_MAP = {
  'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'it': 'it-IT', 'ja': 'ja-JP', 'de': 'de-DE',
};

export default function ChatPanel({ role, messages, onSendMessage, icon, label, langLabel, disabled, languageSelector, speechLang }) {
  const [inputValue, setInputValue] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[speechLang] || speechLang || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    let stoppedManually = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onend = () => {
      // Auto-restart if not manually stopped — keeps listening through pauses
      if (!stoppedManually) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'aborted' || event.error === 'not-allowed') {
        setIsListening(false);
      }
      // For 'no-speech' errors, let onend handle the restart
    };

    // Override stop to set the manual flag
    const originalStop = recognition.stop.bind(recognition);
    recognition.stop = () => {
      stoppedManually = true;
      originalStop();
    };
    const originalAbort = recognition.abort.bind(recognition);
    recognition.abort = () => {
      stoppedManually = true;
      originalAbort();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      // Stop listening if active
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  };

  const isPatientPanel = role === 'patient';

  return (
    <div className="flex-1 flex flex-col h-full border-r border-gray-200 last:border-r-0">
      {/* Panel header */}
      <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between ${
        isPatientPanel ? 'bg-blue-50' : 'bg-green-50'
      }`}>
        <div className="flex items-center gap-3">
          <img src={icon} alt={label} width="32" height="32" className="rounded-full" />
          <div className="text-sm font-bold text-gray-900">{label}</div>
        </div>
        {languageSelector ? (
          languageSelector
        ) : (
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">{langLabel}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <p className="text-sm text-center">Noch keine Nachrichten</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isPatientMsg = msg.sender === 'patient';
              return (
                <div key={idx} className={`flex ${isPatientMsg ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-2xl px-3 py-2 shadow-sm ${
                    isPatientMsg
                      ? 'bg-blue-500 text-white rounded-bl-sm'
                      : 'bg-green-500 text-white rounded-br-sm'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {renderTextWithHighlights(highlightMedicalTerms(msg.text), setSelectedTerm)}
                    </div>
                    <div className="text-xs mt-1 text-right opacity-60">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-end">
          <button
            onClick={toggleListening}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isListening ? 'Stop' : 'Spracheingabe'}
          >
            {isListening ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
                <line x1="12" y1="17" x2="12" y2="22"/>
              </svg>
            )}
          </button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label={isPatientPanel ? `Message input in ${langLabel}` : 'Message input in German'}
            placeholder={isListening
              ? (isPatientPanel ? `Listening in ${langLabel}...` : 'Zuhören...')
              : (isPatientPanel ? `Type in ${langLabel}...` : `Auf Deutsch schreiben...`)
            }
            disabled={disabled}
            className={`flex-1 px-3 py-2 border rounded-xl resize-none focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
              isListening
                ? 'border-red-300 focus:ring-red-400 bg-red-50'
                : (isPatientPanel ? 'border-blue-200 focus:ring-blue-400' : 'border-green-200 focus:ring-green-400')
            }`}
            rows="1"
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            disabled={disabled || !inputValue.trim()}
            className={`px-3 py-2 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isPatientPanel ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Senden
          </button>
        </div>
      </div>

      {/* Medical Term Dialog */}
      {selectedTerm && (
        <MedicalTermDialog term={selectedTerm} onClose={() => setSelectedTerm(null)} />
      )}
    </div>
  );
}
