"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Bookmark,
  Layers,
  RotateCcw,
  Send,
  Flame,
  CheckCircle2,
  Play,
  Trash2,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';

import {
  EnglishLevel,
  TutorPersona,
  PracticeScenario,
  ConversationTurn,
  FeedbackAnalysis
} from '@/types/english-coach';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';
import { TUTOR_PERSONAS } from '@/lib/english-coach/personas';
import { PRACTICE_SCENARIOS } from '@/lib/english-coach/scenarios';
import { executeConversationTurn, AIProvider } from '@/lib/english-coach/modelProviders';

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

import VoiceVisualizerOrb from '@/components/english-coach/VoiceVisualizerOrb';
import TurnFeedbackCard from '@/components/english-coach/TurnFeedbackCard';
import LevelBadgeSelector from '@/components/english-coach/LevelBadgeSelector';
import PersonaSelectorModal from '@/components/english-coach/PersonaSelectorModal';
import SettingsModal from '@/components/english-coach/SettingsModal';
import BottomAppDock, { AppTab } from '@/components/english-coach/BottomAppDock';
import { SavedVocabItem } from '@/components/english-coach/VocabVaultModal';

const SURPRISE_TOPICS: Record<EnglishLevel, string[]> = {
  basic: [
    "What did you have for breakfast today, and what is your favorite meal?",
    "Can you describe your hometown and what you like most about it?",
    "What kind of music or movies do you enjoy when you want to relax?"
  ],
  intermediate: [
    "If you could travel to any country tomorrow with no budget limit, where would you go and why?",
    "Tell me about a challenging project or hobby you worked on recently. How did you overcome obstacles?",
    "Do you think social media has a mostly positive or negative effect on how people communicate?"
  ],
  pro: [
    "How do you balance rapid innovation with enterprise stability when managing critical initiatives?",
    "What rhetorical strategies do you find most effective when persuading a skeptical leadership team?",
    "In your view, what differentiates an adequate manager from an exceptional executive leader?"
  ]
};

export default function StandaloneEnglishCoachPage() {
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<AppTab>('voice');

  // Application State
  const [level, setLevel] = useState<EnglishLevel>('intermediate');
  const [selectedPersona, setSelectedPersona] = useState<TutorPersona>(TUTOR_PERSONAS[0]);
  const [activeScenario, setActiveScenario] = useState<PracticeScenario | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');

  // Modals & Settings
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('offline');
  const [apiKey, setApiKey] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [continuousMode, setContinuousMode] = useState(false);
  const [savedVocab, setSavedVocab] = useState<SavedVocabItem[]>([]);
  const [streakDays, setStreakDays] = useState(3);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Speech Synthesis Hook
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    isSpeaking,
    speak,
    stopSpeaking,
    setVoiceByAccent
  } = useSpeechSynthesis({
    onSpeakEnd: () => {
      if (continuousMode && !isListening) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    }
  });

  // Speech Recognition Hook
  const handleTranscriptComplete = (transcript: string) => {
    if (transcript.trim() && !isProcessing) {
      handleUserSubmit(transcript.trim());
    }
  };

  const {
    isListening,
    interimTranscript,
    volumeLevel,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onTranscriptComplete: handleTranscriptComplete,
    continuous: false
  });

  // Keyboard shortcut: Spacebar to toggle microphone
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTab === 'voice' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleToggleMic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isListening, isSpeaking, isProcessing]);

  // Load saved settings & initial greeting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProvider = localStorage.getItem('english_ai_provider') as AIProvider;
      const storedKey = localStorage.getItem('english_api_key') || localStorage.getItem('gemini_api_key') || '';
      const storedVocab = localStorage.getItem('english_vocab_vault');
      const storedLevel = localStorage.getItem('english_level') as EnglishLevel;

      if (storedProvider) setAiProvider(storedProvider);
      if (storedKey) setApiKey(storedKey);
      if (storedVocab) {
        try {
          setSavedVocab(JSON.parse(storedVocab));
        } catch (e) {}
      }
      if (storedLevel && LEVEL_CONFIGS[storedLevel]) {
        setLevel(storedLevel);
      }
    }
  }, []);

  // Sync speed with level
  useEffect(() => {
    const config = LEVEL_CONFIGS[level];
    setSpeechRate(config.speed);
  }, [level]);

  // Initial tutor greeting when persona or scenario changes
  useEffect(() => {
    const initialGreeting: ConversationTurn = {
      id: 'greeting',
      speaker: 'tutor',
      text: activeScenario ? activeScenario.starterPrompt : selectedPersona.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTurns([initialGreeting]);
  }, [selectedPersona, activeScenario]);

  // Auto-scroll in feedback tab
  useEffect(() => {
    if (activeTab === 'feed') {
      turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns, isProcessing, activeTab]);

  // Handle user speech or text input submission
  const handleUserSubmit = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    stopListening();
    setIsProcessing(true);

    const userTurn: ConversationTurn = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTurns(prev => [...prev, userTurn]);
    setTextInput('');

    const history = turns.slice(-6).map(t => ({
      role: (t.speaker === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: t.text
    }));

    try {
      const scenarioContext = activeScenario
        ? `Scenario: ${activeScenario.title}. Goal: ${activeScenario.description}`
        : undefined;

      const result = await executeConversationTurn(
        text,
        level,
        selectedPersona,
        { provider: aiProvider, apiKey },
        scenarioContext,
        history
      );

      // Attach feedback to user's turn
      setTurns(prev =>
        prev.map(t => (t.id === userTurn.id ? { ...t, feedback: result.feedback } : t))
      );

      // Add tutor's spoken reply turn
      const tutorTurn: ConversationTurn = {
        id: `tutor-${Date.now()}`,
        speaker: 'tutor',
        text: result.spokenReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTurns(prev => [...prev, tutorTurn]);

      // Speak response aloud
      speak(result.spokenReply, speechRate);
    } catch (err) {
      console.error('Error generating AI response:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('english_api_key', key);
    }
  };

  const handleSaveVocab = (word: string, meaning: string, example: string) => {
    const newItem: SavedVocabItem = {
      id: `vocab-${Date.now()}`,
      word,
      meaning,
      example,
      level,
      dateAdded: new Date().toLocaleDateString()
    };
    const updated = [newItem, ...savedVocab];
    setSavedVocab(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('english_vocab_vault', JSON.stringify(updated));
    }
  };

  const handleDeleteVocab = (id: string) => {
    const updated = savedVocab.filter(v => v.id !== id);
    setSavedVocab(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('english_vocab_vault', JSON.stringify(updated));
    }
  };

  const handleSurprisePrompt = () => {
    const pool = SURPRISE_TOPICS[level];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const turn: ConversationTurn = {
      id: `prompt-${Date.now()}`,
      speaker: 'tutor',
      text: `Let's practice your spontaneous speaking! Topic: "${pick}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTurns(prev => [...prev, turn]);
    speak(turn.text, speechRate);
    if (activeTab !== 'voice') {
      setActiveTab('voice');
    }
  };

  const handleResetConversation = () => {
    stopSpeaking();
    stopListening();
    const resetGreeting: ConversationTurn = {
      id: 'greeting-reset',
      speaker: 'tutor',
      text: activeScenario ? activeScenario.starterPrompt : selectedPersona.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTurns([resetGreeting]);
  };

  const currentOrbState = isListening
    ? 'listening'
    : isProcessing
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  const levelCfg = LEVEL_CONFIGS[level];
  const latestUserTurn = [...turns].reverse().find(t => t.speaker === 'user' && t.feedback);
  const latestTutorTurn = [...turns].reverse().find(t => t.speaker === 'tutor');

  return (
    <div className="h-[100dvh] w-screen bg-ink text-paper flex flex-col overflow-hidden font-sans selection:bg-orange-brand selection:text-ink relative">
      {/* ============ TOP APP HEADER / STATUS BAR ============ */}
      <header className="shrink-0 z-30 bg-steel-1/90 backdrop-blur-xl border-b border-line/70 px-4 py-2.5 flex items-center justify-between">
        {/* Left: App Logo & Day Streak */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-brand to-orange-dim flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-brand/20">
              FV
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white leading-none">FluentVoice</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-brand/20 text-orange-brand font-bold">
                  PRO
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-line/80 hidden sm:block" />

          {/* Day Streak Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-brand/10 border border-orange-brand/30 text-orange-brand font-mono text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-orange-brand" />
            <span>{streakDays}d</span>
          </div>
        </div>

        {/* Center: Segmented Level Switcher */}
        <div className="w-56 sm:w-72">
          <LevelBadgeSelector
            currentLevel={level}
            onSelectLevel={lvl => {
              setLevel(lvl);
              if (typeof window !== 'undefined') {
                localStorage.setItem('english_level', lvl);
              }
            }}
          />
        </div>

        {/* Right: Persona Chip, AI Provider & Settings */}
        <div className="flex items-center gap-2">
          {/* AI Provider Chip */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-steel-2/70 hover:bg-steel-2 border border-line rounded-xl px-2 py-1.5 text-[10px] font-mono transition-colors cursor-pointer"
            title="Active Model Provider"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${aiProvider === 'offline' ? 'bg-emerald-400' : 'bg-orange-brand animate-ping'}`} />
            <span className="capitalize">{aiProvider === 'offline' ? 'CEFR Engine' : aiProvider}</span>
          </button>

          {/* Persona Chip */}
          <button
            onClick={() => setIsPersonaModalOpen(true)}
            className="flex items-center gap-1.5 bg-steel-2 hover:bg-steel-2/80 border border-line rounded-xl px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer"
            title="Change AI Tutor"
          >
            <span className="text-sm">{selectedPersona.avatar}</span>
            <span className="hidden sm:inline text-white font-medium">{selectedPersona.name.split(' ')[0]}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-steel-2 hover:bg-steel-2/80 text-paper-dim hover:text-white border border-line transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============ MAIN VIEWPORT CONTENT ============ */}
      <main className="flex-1 overflow-hidden relative pb-20">
        {/* TAB 1: IMMERSIVE LIVE VOICE VIEW (ChatGPT Voice Style) */}
        {activeTab === 'voice' && (
          <div className="h-full w-full max-w-xl mx-auto flex flex-col justify-between items-center px-4 py-4 relative">
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

            {/* Top Info Bar inside Voice Mode */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {activeScenario ? (
                  <div className="flex items-center gap-1.5 bg-orange-brand/10 border border-orange-brand/30 px-3 py-1 rounded-full text-xs font-mono text-orange-brand">
                    <span>{activeScenario.icon}</span>
                    <span className="font-semibold truncate max-w-[200px]">{activeScenario.title}</span>
                    <button
                      onClick={() => setActiveScenario(null)}
                      className="hover:text-white ml-1 text-[10px]"
                      title="Clear Scenario"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-paper-dim flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Free Conversation ({level.toUpperCase()})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-1.5 rounded-lg bg-steel-2/80 hover:bg-steel-2 text-paper-dim hover:text-red-400 transition-colors"
                    title="Mute audio"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleResetConversation}
                  className="p-1.5 rounded-lg bg-steel-2/80 hover:bg-steel-2 text-paper-dim hover:text-white transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Section: Animated Voice Visualizer Orb */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto">
              {/* Floating Pro Alternative Pill */}
              <AnimatePresence>
                {latestUserTurn?.feedback?.proAlternative && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="w-full max-w-md bg-gradient-to-r from-orange-brand/15 via-steel-1 to-steel-1 border border-orange-brand/40 rounded-2xl p-3 shadow-xl backdrop-blur-md mb-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 text-orange-brand font-mono text-[11px] uppercase font-bold tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pro Phrasing</span>
                      </div>
                      <button
                        onClick={() => speak(latestUserTurn.feedback!.proAlternative, speechRate)}
                        className="text-orange-brand hover:text-white flex items-center gap-1 text-[10px] font-mono bg-orange-brand/10 hover:bg-orange-brand/30 px-2 py-0.5 rounded transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                    <p className="text-paper text-xs sm:text-sm italic leading-relaxed">
                      "{latestUserTurn.feedback.proAlternative}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Central Audio-Reactive Orb */}
              <VoiceVisualizerOrb
                state={currentOrbState}
                volumeLevel={volumeLevel}
                level={level}
                onToggleMic={handleToggleMic}
              />

              {/* Real-Time Floating Subtitle */}
              <div className="min-h-[48px] max-w-md w-full text-center px-4 flex items-center justify-center">
                {interimTranscript ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-300 text-sm md:text-base font-medium italic bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl inline-block"
                  >
                    "{interimTranscript}"
                  </motion.p>
                ) : latestTutorTurn && isSpeaking ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-paper text-sm leading-relaxed"
                  >
                    "{latestTutorTurn.text}"
                  </motion.p>
                ) : (
                  <p className="text-paper-dim text-xs font-mono">
                    {continuousMode ? '🎙️ Hands-Free Mode active • Speak anytime' : 'Press Space or tap orb to speak'}
                  </p>
                )}
              </div>

              {speechError && (
                <div className="mt-2 text-xs text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                  {speechError}
                </div>
              )}
            </div>

            {/* Bottom Quick Bar inside Voice View */}
            <div className="w-full flex items-center justify-between gap-3 z-10 pt-2">
              <button
                onClick={handleSurprisePrompt}
                className="flex-1 py-2.5 px-3 rounded-xl bg-steel-1/90 hover:bg-steel-2 border border-line text-xs font-mono text-paper transition-all flex items-center justify-center gap-1.5 shadow-md hover:border-orange-brand/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-brand" />
                <span>Surprise Topic</span>
              </button>

              <button
                onClick={() => setContinuousMode(!continuousMode)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  continuousMode
                    ? 'bg-orange-brand/20 border-orange-brand text-orange-brand font-semibold'
                    : 'bg-steel-1/90 border-line text-paper-dim hover:text-white'
                }`}
                title="Continuous turn-taking"
              >
                <span className={`w-2 h-2 rounded-full ${continuousMode ? 'bg-orange-brand animate-ping' : 'bg-paper-dim'}`} />
                <span>{continuousMode ? 'Hands-Free ON' : 'Hands-Free OFF'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TURN-BY-TURN FEEDBACK & DIALOGUE VIEW */}
        {activeTab === 'feed' && (
          <div className="h-full max-w-3xl mx-auto flex flex-col justify-between px-4 py-3">
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-line/60">
                <span className="font-mono text-xs text-paper-dim uppercase tracking-wider">
                  Conversation & Grammar Deck ({turns.length} messages)
                </span>
                <button
                  onClick={handleResetConversation}
                  className="text-paper-dim hover:text-white text-xs font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              {turns.map(turn => (
                <TurnFeedbackCard
                  key={turn.id}
                  turn={turn}
                  level={level}
                  onReplayAudio={text => speak(text, speechRate)}
                  onSaveVocab={handleSaveVocab}
                />
              ))}

              {isProcessing && (
                <div className="flex items-center gap-3 my-3">
                  <div className="w-8 h-8 rounded-full bg-steel-2 border border-line flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div className="bg-steel-1 border border-line rounded-2xl px-4 py-3 text-xs font-mono text-paper-dim flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-brand animate-ping" />
                    <span>Analyzing grammar & drafting reply...</span>
                  </div>
                </div>
              )}

              <div ref={turnsEndRef} />
            </div>

            {/* Quick Text Input for Noisy Environments */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUserSubmit(textInput);
              }}
              className="pt-3 border-t border-line/70 flex items-center gap-2 bg-ink"
            >
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Type in English (or switch to Live Voice tab)..."
                className="flex-1 bg-steel-2/90 border border-line rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-paper-dim/40 focus:outline-none focus:border-orange-brand"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isProcessing}
                className="bg-orange-brand hover:bg-orange-dim text-white p-2.5 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ROLEPLAY SCENARIOS VIEW */}
        {activeTab === 'scenarios' && (
          <div className="h-full max-w-4xl mx-auto overflow-y-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div>
                <h2 className="font-display text-lg text-paper uppercase tracking-wide">
                  Real-World Roleplay Scenarios
                </h2>
                <p className="text-paper-dim text-xs font-mono">
                  Select a scenario to practice high-stakes English in context
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {['all', 'basic', 'intermediate', 'pro'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setScenarioFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors ${
                      scenarioFilter === lvl
                        ? 'bg-orange-brand text-white font-bold'
                        : 'bg-steel-2 text-paper-dim hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-6">
              {PRACTICE_SCENARIOS.filter(
                s => scenarioFilter === 'all' || s.level === scenarioFilter
              ).map(sc => {
                const isActive = activeScenario?.id === sc.id;
                const levelCfgItem = LEVEL_CONFIGS[sc.level];

                return (
                  <div
                    key={sc.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-orange-brand/10 border-orange-brand shadow-lg'
                        : 'bg-steel-1/80 border-line hover:border-paper-dim/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-3xl">{sc.icon}</span>
                        <span
                          className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${levelCfgItem.color}20`,
                            color: levelCfgItem.color,
                            border: `1px solid ${levelCfgItem.color}40`
                          }}
                        >
                          {sc.level}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm sm:text-base mt-2.5">
                        {sc.title}
                      </h3>
                      <p className="text-paper-dim text-xs mt-1 leading-relaxed">
                        {sc.description}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        {sc.targetKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono bg-steel-2 px-1.5 py-0.5 rounded text-paper-dim border border-line/60"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveScenario(sc);
                        setLevel(sc.level);
                        setActiveTab('voice');
                      }}
                      className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-orange-brand text-white shadow-lg'
                          : 'bg-steel-2 hover:bg-orange-brand hover:text-white border border-line text-paper'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Continue Scenario' : 'Start Scenario'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: VOCAB VAULT FLASHCARDS VIEW */}
        {activeTab === 'vault' && (
          <div className="h-full max-w-3xl mx-auto overflow-y-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div>
                <h2 className="font-display text-lg text-paper uppercase tracking-wide flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-orange-brand" />
                  <span>Personal Vocab Vault</span>
                </h2>
                <p className="text-paper-dim text-xs font-mono">
                  {savedVocab.length} words saved from your real-time conversations
                </p>
              </div>

              {savedVocab.length > 0 && (
                <button
                  onClick={() => {
                    setSavedVocab([]);
                    localStorage.removeItem('english_vocab_vault');
                  }}
                  className="text-red-400 hover:text-red-300 text-xs font-mono flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {savedVocab.length === 0 ? (
              <div className="text-center py-16 text-paper-dim space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-paper-dim/30" />
                <p className="text-sm font-semibold text-white">Your Vocab Vault is empty</p>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  During voice conversations, tap the bookmark icon on any Pro vocabulary upgrade in the Feedback tab to save it here for pronunciation review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
                {savedVocab.map(item => {
                  const lvlCfg = LEVEL_CONFIGS[item.level || 'intermediate'];
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-steel-1/90 border border-line flex flex-col justify-between group shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-base tracking-wide">
                            {item.word}
                          </span>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold"
                            style={{
                              backgroundColor: `${lvlCfg.color}20`,
                              color: lvlCfg.color,
                              border: `1px solid ${lvlCfg.color}40`
                            }}
                          >
                            {item.level}
                          </span>
                        </div>

                        <p className="text-xs text-paper-dim mt-2 leading-normal">
                          {item.meaning}
                        </p>

                        {item.example && (
                          <p className="text-xs text-orange-brand/90 italic font-mono mt-2 bg-steel-2/50 p-2 rounded-lg">
                            "{item.example}"
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
                        <button
                          onClick={() => speak(item.word, 0.9)}
                          className="text-xs font-mono text-orange-brand hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Pronounce</span>
                        </button>

                        <button
                          onClick={() => handleDeleteVocab(item.id)}
                          className="text-paper-dim/40 hover:text-red-400 p-1 rounded transition-colors"
                          title="Delete word"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============ FLOATING BOTTOM APP DOCK ============ */}
      <BottomAppDock
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        savedVocabCount={savedVocab.length}
        unreadTurnsCount={turns.filter(t => t.speaker === 'user').length}
      />

      {/* ============ MODALS ============ */}
      <PersonaSelectorModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        selectedPersona={selectedPersona}
        onSelectPersona={p => {
          setSelectedPersona(p);
          setVoiceByAccent(p.accent, p.voiceGender);
        }}
        currentLevel={level}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        provider={aiProvider}
        onProviderChange={p => {
          setAiProvider(p);
          if (typeof window !== 'undefined') {
            localStorage.setItem('english_ai_provider', p);
          }
        }}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        continuousMode={continuousMode}
        onToggleContinuous={setContinuousMode}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
      />
    </div>
  );
}
