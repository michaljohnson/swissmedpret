import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import ChatPanel from './ChatPanel';
import LanguageSelector from './LanguageSelector';
import PictogramPanel from './PictogramPanel';

export default function ConversationPage() {
  // Each panel gets its own message list showing the conversation in its language
  const [patientMessages, setPatientMessages] = useState([]);
  const [staffMessages, setStaffMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  const [showPictogramPanel, setShowPictogramPanel] = useState(false);
  const wsRef = useRef(null);
  const pendingRef = useRef(null);

  const LANG_NAMES = { en: 'English', es: 'Español', fr: 'Français', it: 'Italiano', ja: '日本語' };

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8080/ws/conversation');

        wsRef.current.onopen = () => {
          setConnectionStatus('connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const pending = pendingRef.current;
            if (!pending || !data.translated) return;

            const now = new Date();

            if (pending.sender === 'patient') {
              // Patient typed in their language → translation is German for staff panel
              // Patient panel: already has the original, no new message needed
              // Staff panel: show the German translation as incoming from patient
              setStaffMessages((prev) => [...prev, {
                text: data.translated,
                sender: 'patient',
                timestamp: now,
              }]);
            } else {
              // Staff typed in German → translation is patient language
              // Staff panel: already has the original, no new message needed
              // Patient panel: show the translated text as incoming from staff
              setPatientMessages((prev) => [...prev, {
                text: data.translated,
                sender: 'staff',
                timestamp: now,
              }]);
            }

            if (data.detectedKeywords && Array.isArray(data.detectedKeywords) && data.detectedKeywords.length > 0) {
              setDetectedKeywords(data.detectedKeywords);
              setShowPictogramPanel(true);
            }

            pendingRef.current = null;
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onerror = () => setConnectionStatus('disconnected');
        wsRef.current.onclose = () => {
          setConnectionStatus('disconnected');
          setTimeout(connectWebSocket, 3000);
        };
      } catch {
        setConnectionStatus('disconnected');
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [selectedLanguage]);

  const handlePatientSend = (text) => {
    const now = new Date();

    // Show immediately on patient panel (their own message)
    setPatientMessages((prev) => [...prev, { text, sender: 'patient', timestamp: now }]);

    // Send to backend: patient language → German
    pendingRef.current = { sender: 'patient' };
    sendToBackend(text, selectedLanguage, 'de');
  };

  const handleStaffSend = (text) => {
    const now = new Date();

    // Show immediately on staff panel (their own message)
    setStaffMessages((prev) => [...prev, { text, sender: 'staff', timestamp: now }]);

    // Send to backend: German → patient language
    pendingRef.current = { sender: 'staff' };
    sendToBackend(text, 'de', selectedLanguage);
  };

  const sendToBackend = (text, sourceLang, targetLang) => {
    if (connectionStatus === 'connected' && wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ text, sourceLang, targetLang }));
      } catch (error) {
        console.error('WebSocket send error:', error);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">SwissMedPreter</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Patient Demo</p>
              <p className="text-xs text-gray-500">Case: CASE-001</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500">
                {connectionStatus === 'connected' ? 'Verbunden mit KIS' :
                 connectionStatus === 'connecting' ? 'Verbinde mit KIS...' : 'Getrennt'}
              </span>
            </div>

            {detectedKeywords.length > 0 && (
              <button
                onClick={() => setShowPictogramPanel(!showPictogramPanel)}
                className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600"
              >
                {showPictogramPanel ? 'Hide Terms' : `Terms (${detectedKeywords.length})`}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Split Chat View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Patient side */}
        <ChatPanel
          role="patient"
          messages={patientMessages}
          onSendMessage={handlePatientSend}
          icon="/icon-patient.svg"
          label="Patient"
          langLabel={LANG_NAMES[selectedLanguage] || selectedLanguage.toUpperCase()}
          speechLang={selectedLanguage}
          disabled={connectionStatus !== 'connected'}
          languageSelector={
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={(lang) => { if (lang) setSelectedLanguage(lang); }}
            />
          }
        />

        {/* Staff side */}
        <ChatPanel
          role="staff"
          messages={staffMessages}
          onSendMessage={handleStaffSend}
          icon="/icon-staff.svg"
          label="Staff"
          langLabel="Deutsch"
          speechLang="de"
          disabled={connectionStatus !== 'connected'}
        />

        {/* Pictogram Panel */}
        <PictogramPanel
          keywords={detectedKeywords}
          targetLanguage={selectedLanguage}
          isVisible={showPictogramPanel}
        />
      </div>
    </div>
  );
}
