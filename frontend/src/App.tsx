import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Languages, Mic, Search, ShieldCheck, Square, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { languages } from '@/data/languages';

type TranscriptEntry = {
  id: string;
  speaker: 'Doctor' | 'Patient' | 'System';
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  latencyMs: number;
  detectedKeywords: string[];
  timestamp: string;
};

type LexiconEntry = {
  term: string;
  label: string;
  imageUrl: string;
  description: string;
};

type SessionPayload = {
  sourceLanguage: string;
  targetLanguage: string;
  handsFree: boolean;
  transcriptionEnabled: boolean;
  promptText?: string;
};

type StompClient = import('@stomp/stompjs').Client;

const samplePrompts = [
  'My wrist hurts and I think there is an infection around the wound.',
  'I have strong pain in my head and feel dizzy since this morning.',
  'Please breathe deeply. We will check your lungs and your heart now.',
  'Do you feel pain in the stomach after eating?'
];

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL ?? '';

export default function App() {
  const [translationMode, setTranslationMode] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('German');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [lexicon, setLexicon] = useState<LexiconEntry[]>([]);
  const [status, setStatus] = useState('Disconnected');
  const [promptIndex, setPromptIndex] = useState(0);
  const stompClientRef = useRef<StompClient | null>(null);

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/lexicon`)
      .then((response) => response.json())
      .then(setLexicon)
      .catch(() => {
        setLexicon([]);
      });
  }, []);

  useEffect(() => {
    let disposed = false;
    let client: StompClient | null = null;

    const initializeRealtime = async () => {
      try {
        const [{ default: SockJS }, { Client }] = await Promise.all([
          import('sockjs-client'),
          import('@stomp/stompjs'),
        ]);

        if (disposed) return;

        const socket = new SockJS(`${backendBaseUrl}/ws-conversation`);
        client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          onConnect: () => {
            setStatus('Connected to hospital gateway');
            client?.subscribe('/topic/conversation', (message) => {
              const payload: TranscriptEntry = JSON.parse(message.body);
              setEntries((current) => [...current, payload]);
            });
          },
          onStompError: () => setStatus('Connection error'),
          onWebSocketClose: () => setStatus('Disconnected'),
        });

        client.activate();
        stompClientRef.current = client;
      } catch {
        setStatus('Realtime gateway unavailable');
      }
    };

    initializeRealtime();

    return () => {
      disposed = true;
      client?.deactivate();
    };
  }, []);

  const detectedLexicon = useMemo(() => {
    const terms = new Set(entries.flatMap((entry) => entry.detectedKeywords.map((keyword) => keyword.toLowerCase())));
    return lexicon.filter((item) => terms.has(item.term.toLowerCase()));
  }, [entries, lexicon]);

  const manualResults = useMemo(() => {
    if (!manualSearch.trim()) return lexicon.slice(0, 4);
    return lexicon.filter((item) => [item.term, item.label, item.description].some((field) => field.toLowerCase().includes(manualSearch.toLowerCase())));
  }, [manualSearch, lexicon]);

  const sendSessionCommand = (payload: SessionPayload) => {
    if (!stompClientRef.current?.connected) return;
    stompClientRef.current.publish({
      destination: '/app/conversation.process',
      body: JSON.stringify(payload),
    });
  };

  const startSession = () => {
    const nextPrompt = samplePrompts[promptIndex % samplePrompts.length];
    setPromptIndex((current) => current + 1);
    setSessionActive(true);
    sendSessionCommand({
      sourceLanguage,
      targetLanguage,
      handsFree,
      transcriptionEnabled: true,
      promptText: nextPrompt,
    });
  };

  const stopSession = () => {
    setSessionActive(false);
    sendSessionCommand({
      sourceLanguage,
      targetLanguage,
      handsFree,
      transcriptionEnabled: false,
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary"><Stethoscope className="h-6 w-6" /></div>
              <Badge className="bg-accent text-primary">SwissMedPreter · On-Prem Simulation</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Conversation Console</h1>
            <p className="mt-1 text-base text-muted">Live transcription, bilingual support, and medical pictograms designed for clinics and hospital tablets.</p>
          </div>
          <Card className="w-full max-w-md bg-white/90">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">Hospital AI Gateway</p>
                <p className="text-sm text-muted">{status}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-primary" /> Local only
              </div>
            </CardContent>
          </Card>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Session Controls</CardTitle>
                <CardDescription>Start or stop the session, choose languages, and activate hands-free mode for emergencies.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold">Speaker language</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{languages.map((language) => <SelectItem key={language} value={language}>{language}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold">Target language</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{languages.map((language) => <SelectItem key={language} value={language}>{language}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3 xl:col-span-1">
                  <Button className="w-full" size="lg" onClick={startSession}>
                    <Mic className="mr-2 h-4 w-4" /> Start
                  </Button>
                  <Button className="w-full" variant="outline" size="lg" onClick={stopSession}>
                    <Square className="mr-2 h-4 w-4" /> Stop
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3 xl:col-span-1">
                  <div>
                    <p className="text-sm font-semibold">Translation mode</p>
                    <p className="text-xs text-muted">Show both sides</p>
                  </div>
                  <Switch checked={translationMode} onCheckedChange={setTranslationMode} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3 xl:col-span-1">
                  <div>
                    <p className="text-sm font-semibold">Hands-free</p>
                    <p className="text-xs text-muted">Emergency workflow</p>
                  </div>
                  <Switch checked={handsFree} onCheckedChange={setHandsFree} />
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[540px]">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Conversation Stream</CardTitle>
                  <CardDescription>Latency is simulated below 2 seconds, with transcript and translation updates flowing through a local WebSocket channel.</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm">
                  <Activity className="h-4 w-4 text-primary" />
                  {sessionActive ? 'Session running' : 'Session idle'}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[440px] pr-3">
                  <div className="space-y-3">
                    {entries.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-border bg-secondary p-6 text-base text-muted">
                        No transcript yet. Press <span className="font-semibold text-foreground">Start</span> to simulate a conversation turn.
                      </div>
                    )}
                    {entries.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-border bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge>{entry.speaker}</Badge>
                            <Badge className="bg-accent text-primary"><Languages className="mr-1 h-3 w-3" /> {entry.sourceLanguage} → {entry.targetLanguage}</Badge>
                          </div>
                          <div className="text-xs text-muted">{entry.timestamp} · {entry.latencyMs} ms</div>
                        </div>
                        {translationMode ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl bg-secondary p-3">
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Original</div>
                              <div className="text-base leading-7">{entry.originalText}</div>
                            </div>
                            <div className="rounded-2xl bg-accent p-3">
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Translation</div>
                              <div className="text-base leading-7">{entry.translatedText}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg leading-8">{entry.originalText}</div>
                        )}
                        {entry.detectedKeywords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {entry.detectedKeywords.map((keyword) => (
                              <Badge key={`${entry.id}-${keyword}`} className="bg-secondary">{keyword}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Context-Based Pictograms</CardTitle>
                <CardDescription>Detected medical terms trigger visual support for patient understanding.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {detectedLexicon.length === 0 && <div className="rounded-2xl bg-secondary p-4 text-sm text-muted">No medical keywords detected yet.</div>}
                {detectedLexicon.map((item) => (
                  <div key={item.term} className="grid grid-cols-[88px_1fr] gap-3 rounded-2xl border border-border bg-white p-3">
                    <img src={item.imageUrl} alt={item.label} className="h-20 w-20 rounded-2xl border border-border bg-slate-50 object-contain p-2" />
                    <div>
                      <div className="text-base font-semibold">{item.label}</div>
                      <div className="mt-1 text-sm text-muted">{item.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offline Lexicon Search</CardTitle>
                <CardDescription>Manual fallback for clinicians to quickly find a pictogram without leaving the local network.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted" />
                  <Input placeholder="Search wrist, head, infection, lungs..." value={manualSearch} onChange={(event) => setManualSearch(event.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {manualResults.map((item) => (
                    <div key={item.term} className="rounded-2xl border border-border bg-secondary p-3">
                      <img src={item.imageUrl} alt={item.label} className="mb-3 h-24 w-full rounded-xl border border-border bg-white object-contain p-2" />
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-muted">{item.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
