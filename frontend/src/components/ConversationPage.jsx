import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import TranscriptPanel from './TranscriptPanel';
import PictogramPanel from './PictogramPanel';
import ControlBar from './ControlBar';

const MOCK_TRANSLATIONS = {
  'hello': { de: 'Hallo', ar: 'مرحبا' },
  'how are you': { de: 'Wie geht es dir?', ar: 'كيف حالك؟' },
  'i have pain': { de: 'Ich habe Schmerzen', ar: 'لدي ألم' },
  'my head hurts': { de: 'Mein Kopf tut weh', ar: 'رأسي يؤلمني' },
  'fever': { de: 'Fieber', ar: 'حمى' },
  'wrist pain': { de: 'Handgelenkschmerzen', ar: 'آلام المعصم' },
  'heart pain': { de: 'Herzschmerzen', ar: 'آلام القلب' },
  'knee pain': { de: 'Knieschmerzen', ar: 'آلام الركبة' },
};

export default function ConversationPage() {
  const [messages, setMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isRecording, setIsRecording] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  const [showPictogramPanel, setShowPictogramPanel] = useState(false);
  const wsRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8080/ws/conversation');

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received from WebSocket:', data);

            // Add translated message to transcript
            if (data.translated) {
              setMessages((prev) => [
                ...prev,
                {
                  text: data.original || data.translated,
                  language: selectedLanguage,
                  role: 'patient',
                  timestamp: new Date(),
                },
                {
                  text: data.translated,
                  language: 'de',
                  role: 'staff',
                  timestamp: new Date(),
                },
              ]);
            }

            // Extract keywords if provided
            if (data.detectedKeywords && Array.isArray(data.detectedKeywords)) {
              setDetectedKeywords(data.detectedKeywords);
              setShowPictogramPanel(true);

              // Auto-hide pictogram panel after 5 seconds
              setTimeout(() => setShowPictogramPanel(false), 5000);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket closed');
          setConnectionStatus('disconnected');
          // Retry connection after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('disconnected');
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedLanguage]);

  // Fallback: If WebSocket fails, use mock data
  const handleSendMessageLocal = (text) => {
    if (!text.trim()) return;

    // Add message to transcript (patient side)
    setMessages((prev) => [
      ...prev,
      {
        text: text,
        language: selectedLanguage,
        role: 'patient',
        timestamp: new Date(),
      },
    ]);

    // Extract mock translation
    const lowerText = text.toLowerCase();
    let translatedText = null;

    for (const [key, value] of Object.entries(MOCK_TRANSLATIONS)) {
      if (lowerText.includes(key)) {
        translatedText = value.de;
        break;
      }
    }

    // If no mock translation found, use a generic response
    if (!translatedText) {
      translatedText = 'Ich verstehe. Können Sie mir mehr details geben?'; // Generic German response
    }

    // Add translated message (staff side)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: translatedText,
          language: 'de',
          role: 'staff',
          timestamp: new Date(),
        },
      ]);

      // Extract keywords from the message
      const keywords = [];
      const medicalTerms = ['kopf', 'handgelenk', 'herz', 'knie', 'schmerzen', 'fieber'];
      medicalTerms.forEach((term) => {
        if (lowerText.includes(term)) {
          keywords.push(term);
        }
      });

      if (keywords.length > 0) {
        setDetectedKeywords(keywords);
        setShowPictogramPanel(true);
        setTimeout(() => setShowPictogramPanel(false), 5000);
      }
    }, 500);
  };

  // Send message via WebSocket if connected, otherwise use local fallback
  const handleSendMessage = (text) => {
    if (connectionStatus === 'connected' && wsRef.current) {
      try {
        wsRef.current.send(
          JSON.stringify({
            text: text,
            sourceLang: selectedLanguage,
            targetLang: 'de',
          })
        );
      } catch (error) {
        console.error('Error sending message via WebSocket:', error);
        handleSendMessageLocal(text);
      }
    } else {
      handleSendMessageLocal(text);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
      {/* Header */}
      <Header patientName="Patient Demo" caseNumber="CASE-001" />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Transcript Panel */}
        <div className="flex-1 flex flex-col">
          <TranscriptPanel messages={messages} />
        </div>

        {/* Pictogram Panel */}
        <PictogramPanel
          keywords={detectedKeywords}
          targetLanguage={selectedLanguage}
          isVisible={showPictogramPanel}
        />
      </div>

      {/* Control Bar */}
      <ControlBar
        isRecording={isRecording}
        onRecordingToggle={() => setIsRecording(!isRecording)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={(lang) => {
          if (lang) setSelectedLanguage(lang);
        }}
        isHandsFree={isHandsFree}
        onHandsFreeToggle={() => setIsHandsFree(!isHandsFree)}
        connectionStatus={connectionStatus}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
