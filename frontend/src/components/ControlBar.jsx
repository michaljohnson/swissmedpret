import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';

export default function ControlBar({
  selectedLanguage,
  onLanguageChange,
  connectionStatus,
  onSendMessage,
  activeRole,
  onRoleChange,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isPatient = activeRole === 'patient';

  return (
    <div className="bg-white border-t border-gray-200 shadow-sm p-4">
      <div className="max-w-2xl mx-auto">
        {/* Top row: role toggle + language + status */}
        <div className="flex items-center justify-between mb-3">
          {/* Role toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => onRoleChange('patient')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPatient
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <img src="/icon-patient.svg" alt="" width="18" height="18" className="rounded-full" />
              Patient
            </button>
            <button
              onClick={() => onRoleChange('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isPatient
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <img src="/icon-staff.svg" alt="" width="18" height="18" className="rounded-full" />
              Staff
            </button>
          </div>

          {/* Language selector */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />

          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-gray-500">
              {connectionStatus === 'connected' ? 'Verbunden' :
               connectionStatus === 'connecting' ? 'Verbinde...' :
               'Getrennt'}
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="flex gap-2 items-end">
          <div className={`flex-1 flex items-center gap-2 px-3 py-2 border rounded-xl ${
            isPatient ? 'border-blue-300 bg-blue-50' : 'border-green-300 bg-green-50'
          }`}>
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
              {isPatient ? selectedLanguage.toUpperCase() : 'DE'}
            </span>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isPatient
                ? `Type in ${selectedLanguage.toUpperCase()}...`
                : 'Auf Deutsch schreiben...'
              }
              disabled={connectionStatus !== 'connected'}
              className="flex-1 bg-transparent resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              rows="1"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={connectionStatus !== 'connected' || !inputValue.trim()}
            className={`px-4 py-2 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isPatient
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}
