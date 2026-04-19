import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';

export default function ControlBar({
  isRecording,
  onRecordingToggle,
  selectedLanguage,
  onLanguageChange,
  isHandsFree,
  onHandsFreeToggle,
  connectionStatus,
  onSendMessage,
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

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Connection Status */}
        <div className="mb-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-xs font-semibold text-gray-600">
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Disconnected'}
          </span>
        </div>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Left: Language Selector */}
          <div>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={onLanguageChange}
            />
          </div>

          {/* Center: Recording Control */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Recording</label>
            <button
              onClick={onRecordingToggle}
              disabled={connectionStatus !== 'connected'}
              className={`btn-primary ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} w-full`}
            >
              {isRecording ? '⏹ Stop Recording' : '⚫ Start Recording'}
            </button>
          </div>

          {/* Right: Hands-Free Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Hands-Free Mode</label>
            <button
              onClick={onHandsFreeToggle}
              className={`btn-toggle w-full ${
                isHandsFree
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isHandsFree ? '🎤 Active' : '🔇 Off'}
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type message (as if transcribed from patient)..."
            disabled={connectionStatus !== 'connected'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={connectionStatus !== 'connected' || !inputValue.trim()}
            className="btn-primary self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
