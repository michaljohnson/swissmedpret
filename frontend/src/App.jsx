import { useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';
import { Activity, BadgeAlert, Globe2, Languages, Mic, MicOff, MonitorSpeaker, Search, ShieldCheck, TimerReset } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Switch } from './components/ui';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const LANGUAGES = [
  'German', 'English', 'French', 'Italian', 'Spanish', 'Portuguese', 'Arabic', 'Turkish', 'Albanian', 'Serbian',
  'Croatian', 'Bosnian', 'Ukrainian', 'Russian', 'Polish', 'Romanian', 'Tamil', 'Tigrinya', 'Farsi', 'Swiss German'
];

const LOCAL_PICTOGRAMS = {
  wrist: { svg: '🦴', title: 'Wrist', description: 'Joint area pictogram for pain or fracture explanations.' },
  infection: { svg: '🦠', title: 'Infection', description: 'Illustration used for infection risk and hygiene guidance.' },
  head: { svg: '🧠', title: 'Head', description: 'Head symptom overview for dizziness, headache, or trauma.' },
  fever: { svg: '🌡️', title: 'Fever', description: 'Temperature icon for triage and symptom explanation.' },
  heart: { svg: '❤️', title: 'Heart', description: 'Cardiac pictogram for chest pain and pulse checks.' },
  lung: { svg: '🫁', title: 'Lung', description: 'Respiratory illustration for breathing difficulty discussions.' }
};

const initialMessages = [
  {
    id: 'seed-1',
    speaker: 'doctor',
    originalText: 'Welcome. Please tell me where you feel pain today.',
    translatedText: 'Willkommen. Bitte sagen Sie mir, wo Sie heute Schmerzen haben.',
    sourceLanguage: 'English',
    targetLanguage: 'German',
    timestamp: new Date().toISOString(),
    detectedKeywords: []
  }
];

function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [isRunning, setIsRunning] = useState(false);
  const [translationMode, setTranslationMode] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('German');
  const [targetLanguage, setTargetLanguage] = useState('Arabic');
  const [draft, setDraft] = useState('My wrist hurts and I am worried about an infection.');
  const [manualSearch, setManualSearch] = useState('');
  const [latency, setLatency] = useState(0);
  const [connection, setConnection] = useState('Connecting to local hospital relay...');
  const stompRef = useRef(null);
  const [activeLexicon, setActiveLexicon] = useState([]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      debug: () => {}
    });

    client.onConnect = () => {
      setConnection('Connected to on-prem relay');
      client.subscribe('/topic/conversation', (frame) => {
        const payload = JSON.parse(frame.body);
        setMessages((prev) => [...prev, payload]);
        if (payload.detectedKeywords?.length) {
          setActiveLexicon(payload.detectedKeywords);
        }
        setLatency(payload.simulatedLatencyMs || 0);
      });
    };

    client.onWebSocketClose = () => {
      setConnection('Local relay unavailable');
    };

    client.onStompError = () => {
      setConnection('Local relay unavailable');
    };

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const submitMessage = async () => {
    if (!draft.trim()) return;
    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: draft,
        sourceLanguage,
        targetLanguage,
        handsFree,
        speaker: messages.length % 2 === 0 ? 'patient' : 'doctor'
      })
    });
    if (!response.ok) {
      setConnection('Local relay unavailable');
      return;
    }
    const data = await response.json();
    stompRef.current?.publish({
      destination: '/app/conversation',
      body: JSON.stringify(data)
    });
    setDraft('');
  };

  const visibleLexicon = useMemo(() => {
    if (manualSearch.trim()) {
      return Object.entries(LOCAL_PICTOGRAMS)
        .filter(([key, value]) => `${key} ${value.title} ${value.description}`.toLowerCase().includes(manualSearch.toLowerCase()))
        .map(([key]) => key);
    }
    return activeLexicon.length ? activeLexicon : Object.keys(LOCAL_PICTOGRAMS).slice(0, 3);
  }, [manualSearch, activeLexicon]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="bg-gradient-to-r from-cyan-50 to-white">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge className="mb-3">SwissMedPreter Conversation</Badge>
                  <CardTitle className="text-3xl">Real-time medical conversation</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-base">
                    Local-only transcription, translation, and visual support for patient-safe communication.
                  </CardDescription>
                </div>
                <div className="rounded-3xl border border-cyan-100 bg-white p-4 text-sm shadow-sm">
                  <div className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4" /> On-prem hospital network</div>
                  <div className="mt-2 text-muted-foreground">{connection}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Session controls</CardTitle>
              <CardDescription>Large touch targets for tablets and emergency use.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" onClick={() => setIsRunning(true)}><Mic className="h-5 w-5" /> Start</Button>
                <Button size="lg" variant="outline" onClick={() => setIsRunning(false)}><MicOff className="h-5 w-5" /> Stop</Button>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <div className="font-medium">Translation mode</div>
                    <div className="text-sm text-muted-foreground">Show original and translated text side-by-side</div>
                  </div>
                  <Switch checked={translationMode} onCheckedChange={setTranslationMode} />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <div className="font-medium">Hands-free</div>
                    <div className="text-sm text-muted-foreground">Fast emergency operation and simulated voice control</div>
                  </div>
                  <Switch checked={handsFree} onCheckedChange={setHandsFree} />
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.8fr]">
          <Card className="min-h-[620px]">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5" /> Bilingual transcript</CardTitle>
                  <CardDescription>Simulated latency target under 2 seconds. Current: {latency} ms</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="h-11 rounded-2xl border border-input bg-white px-4 text-base">
                    {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
                  </select>
                  <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="h-11 rounded-2xl border border-input bg-white px-4 text-base">
                    {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex h-full flex-col gap-4">
              <div className="grid gap-3 rounded-3xl bg-slate-50 p-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-medium"><Globe2 className="h-4 w-4" /> Original</div>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium"><MonitorSpeaker className="h-4 w-4" /> Translation</div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-auto pr-1">
                {messages.map((message) => (
                  <div key={message.id} className="rounded-3xl border border-border p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={message.speaker === 'doctor' ? 'bg-cyan-100' : 'bg-slate-200'}>{message.speaker}</Badge>
                        <span className="text-sm text-muted-foreground">{message.sourceLanguage} → {message.targetLanguage}</span>
                      </div>
                      {message.detectedKeywords?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.detectedKeywords.map((keyword) => <Badge key={keyword}>{keyword}</Badge>)}
                        </div>
                      )}
                    </div>
                    <div className={translationMode ? 'grid gap-3 md:grid-cols-2' : 'grid gap-3'}>
                      <div className="rounded-2xl bg-white p-4 text-lg leading-7">{message.originalText}</div>
                      {translationMode && <div className="rounded-2xl bg-cyan-50 p-4 text-lg leading-7">{message.translatedText}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 rounded-3xl border border-border bg-slate-50 p-3">
                <Label htmlFor="speech">Simulated live utterance</Label>
                <Input id="speech" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Speak or type a medical sentence..." disabled={!isRunning} />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={submitMessage} disabled={!isRunning}>Send utterance</Button>
                  <Button variant="secondary" onClick={() => setDraft('The patient has head pain and fever since this morning.')} disabled={!isRunning}>Load triage example</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Offline lexicon</CardTitle>
                <CardDescription>Fallback local search for medical illustrations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={manualSearch} onChange={(e) => setManualSearch(e.target.value)} placeholder="Search wrist, infection, head..." />
                <div className="grid gap-3">
                  {visibleLexicon.map((key) => (
                    <div key={key} className="rounded-3xl border border-border bg-white p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-3xl">{LOCAL_PICTOGRAMS[key].svg}</div>
                        <div>
                          <div className="text-lg font-semibold">{LOCAL_PICTOGRAMS[key].title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{LOCAL_PICTOGRAMS[key].description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Status overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="flex items-center gap-2"><Activity className="h-4 w-4" /> Session state</span><strong>{isRunning ? 'Listening' : 'Stopped'}</strong></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="flex items-center gap-2"><TimerReset className="h-4 w-4" /> Latency goal</span><strong>&lt; 2 sec</strong></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="flex items-center gap-2"><BadgeAlert className="h-4 w-4" /> Privacy</span><strong>Local only</strong></div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
