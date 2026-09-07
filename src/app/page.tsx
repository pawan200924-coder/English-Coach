"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Bookmark,
  Compass,
  RotateCcw,
  Send,
  Flame,
  CheckCircle2,
  Play,
  Trash2,
  TrendingUp,
  X,
  PhoneOff
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
  const handleTranscriptComplete = useCallback((transcript: string) => {
    if (transcript.trim() && !isProcessing) {
      handleUserSubmit(transcript.trim());
    }
  }, [isProcessing]);

  const {
    isListening,
    interimTranscript,
    volumeLevel,
    isSupported: isSpeechSupported,
    error: speechError,
    permissionState,
    isAudioDetected,
    startListening,
    stopListening,
    submitNow,
    clearTranscript
  } = useSpeechRecognition({
    onTranscriptComplete: handleTranscriptComplete,
    continuous: continuousMode
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
      if (interimTranscript.trim()) {
        submitNow();
      } else {
        stopListening();
      }
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

  const latestUserTurn = [...turns].reverse().find(t => t.speaker === 'user' && t.feedback);
  const latestTutorTurn = [...turns].reverse().find(t => t.speaker === 'tutor');

  return (
    <div className="h-[100dvh] w-screen aurora-canvas text-white flex flex-col overflow-hidden font-sans select-none relative">
      {/* ============ TOP APP HEADER ============ */}
      <header className="shrink-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Logo & Day Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full rounded-[14px] bg-[#0A0D14] flex items-center justify-center font-bold text-xs text-white">
                FV
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white/95">FluentVoice</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  AI
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Day Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-amber-300 text-xs font-semibold shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streakDays}d Streak</span>
          </div>
        </div>

        {/* Center: Sleek Level Switcher */}
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
            className="hidden sm:flex items-center gap-1.5 glass-pill rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white transition-all cursor-pointer hover:border-white/20"
            title="Active Model Provider"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${aiProvider === 'offline' ? 'bg-emerald-400' : 'bg-violet-400 animate-pulse'}`} />
            <span className="capitalize">{aiProvider === 'offline' ? 'CEFR Engine' : aiProvider}</span>
          </button>

          {/* Persona Chip */}
          <button
            onClick={() => setIsPersonaModalOpen(true)}
            className="flex items-center gap-1.5 glass-pill rounded-full px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.08] transition-all cursor-pointer hover:border-white/20"
            title="Change AI Tutor"
          >
            <span className="text-sm">{selectedPersona.avatar}</span>
            <span className="hidden sm:inline font-medium">{selectedPersona.name.split(' ')[0]}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-full glass-pill text-white/60 hover:text-white transition-colors cursor-pointer hover:border-white/20"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============ MAIN VIEWPORT CONTENT ============ */}
      <main className="flex-1 overflow-hidden relative pb-24">
        {/* TAB 1: IMMERSIVE LIVE VOICE CALL (ChatGPT Voice Style) */}
        {activeTab === 'voice' && (
          <div className="h-full w-full max-w-xl mx-auto flex flex-col justify-between items-center px-4 py-4 relative">
            {/* Top Call Info Status */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {activeScenario ? (
                  <div className="flex items-center gap-2 glass-pill px-3.5 py-1.5 rounded-full text-xs text-violet-300 border-violet-500/30">
                    <span className="text-sm">{activeScenario.icon}</span>
                    <span className="font-medium truncate max-w-[200px]">{activeScenario.title}</span>
                    <button
                      onClick={() => setActiveScenario(null)}
                      className="hover:text-white ml-1 text-white/40"
                      title="End Scenario"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="glass-pill px-3 py-1 rounded-full text-xs text-white/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Free Conversation ({level.toUpperCase()})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-2 rounded-full glass-pill text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Mute AI Voice"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleResetConversation}
                  className="p-2 rounded-full glass-pill text-white/60 hover:text-white transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Living Voice Sphere Section */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto">
              {/* Floating Pro Alternative Pill */}
              <AnimatePresence>
                {latestUserTurn?.feedback?.proAlternative && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    className="w-full max-w-md glass-panel rounded-2xl p-4 shadow-2xl mb-4 text-left border border-violet-500/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
                      <div className="flex items-center gap-1.5 text-violet-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pro Native Phrasing</span>
                      </div>
                      <button
                        onClick={() => speak(latestUserTurn.feedback!.proAlternative, speechRate)}
                        className="text-violet-300 hover:text-white flex items-center gap-1 text-[11px] bg-violet-500/20 hover:bg-violet-500/30 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                    <p className="text-white/95 text-xs sm:text-sm italic leading-relaxed relative z-10">
                      "{latestUserTurn.feedback.proAlternative}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Central Audio-Reactive Ethereal Sphere */}
              <VoiceVisualizerOrb
                state={currentOrbState}
                volumeLevel={volumeLevel}
                level={level}
                onToggleMic={handleToggleMic}
              />

              {/* Real-Time Clean Subtitle Transcript */}
              <div className="min-h-[64px] max-w-md w-full text-center px-4 flex flex-col items-center justify-center gap-2">
                {interimTranscript ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-300 text-sm md:text-base font-medium italic bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl inline-block shadow-sm"
                    >
                      "{interimTranscript}"
                    </motion.p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={submitNow}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full text-xs cursor-pointer transition-all shadow-md shadow-emerald-500/30"
                      >
                        <span>Send Spoken Reply</span>
                        <Send className="w-3 h-3" />
                      </button>
                      <button
                        onClick={clearTranscript}
                        className="px-3 py-1.5 text-white/50 hover:text-white rounded-full text-xs glass-pill transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isAudioDetected ? 'Hearing your voice... speak naturally' : 'Microphone listening • Speak anytime'}</span>
                  </div>
                ) : latestTutorTurn && isSpeaking ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/90 text-sm md:text-base font-medium leading-relaxed max-w-md"
                  >
                    "{latestTutorTurn.text}"
                  </motion.p>
                ) : (
                  <p className="text-white/40 text-xs">
                    {continuousMode ? '🎙️ Hands-Free Active • Speak naturally anytime' : 'Press Spacebar or tap sphere to speak'}
                  </p>
                )}
              </div>

              {speechError && (
                <div className="mt-3 text-xs text-amber-200 bg-amber-500/15 px-4 py-3 rounded-2xl border border-amber-500/30 max-w-md text-center flex flex-col items-center gap-2 shadow-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Microphone Assistance</span>
                  </div>
                  <p className="leading-relaxed">{speechError}</p>
                  <button
                    onClick={handleToggleMic}
                    className="px-3.5 py-1 bg-amber-400 text-black font-semibold rounded-full text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Try Microphone Again
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Quick Action Pill Bar */}
            <div className="w-full flex items-center justify-between gap-3 z-10 pt-2 max-w-md">
              <button
                onClick={handleSurprisePrompt}
                className="flex-1 py-2.5 px-4 rounded-full glass-pill text-xs font-medium text-white/90 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm hover:border-violet-500/40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Surprise Topic</span>
              </button>

              <button
                onClick={() => setContinuousMode(!continuousMode)}
                className={`py-2.5 px-4 rounded-full border text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                  continuousMode
                    ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                    : 'glass-pill text-white/60 hover:text-white'
                }`}
                title="Continuous conversation mode"
              >
                <span className={`w-2 h-2 rounded-full ${continuousMode ? 'bg-violet-400 animate-ping' : 'bg-white/30'}`} />
                <span>{continuousMode ? 'Hands-Free ON' : 'Hands-Free OFF'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TURN-BY-TURN COACHING & GRAMMAR FEED */}
        {activeTab === 'feed' && (
          <div className="h-full max-w-3xl mx-auto flex flex-col justify-between px-4 py-4">
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                  Conversation & Fluency History ({turns.length})
                </span>
                <button
                  onClick={handleResetConversation}
                  className="text-white/40 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear History</span>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-md shadow-violet-500/20">
                    AI
                  </div>
                  <div className="glass-panel rounded-2xl px-4 py-3 text-xs text-white/70 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    <span>Analyzing grammar & crafting reply...</span>
                  </div>
                </div>
              )}

              <div ref={turnsEndRef} />
            </div>

            {/* Quick Text / Voice Input for Coaching */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 bg-transparent">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 animate-pulse'
                    : 'glass-pill text-white/70 hover:text-white hover:border-white/30'
                }`}
                title={isListening ? 'Click to submit speech' : 'Speak your message'}
              >
                {isListening ? <Mic className="w-4 h-4 stroke-[2.5]" /> : <Mic className="w-4 h-4" />}
              </button>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  const val = textInput.trim() || interimTranscript.trim();
                  if (val) {
                    handleUserSubmit(val);
                    clearTranscript();
                  }
                }}
                className="flex-1 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={textInput || (isListening ? interimTranscript : '')}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={isListening ? 'Listening to your voice... speak now' : 'Type or click mic to speak...'}
                  className="flex-1 glass-panel rounded-full px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={(!textInput.trim() && !interimTranscript.trim()) || isProcessing}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer shadow-md shadow-violet-500/25 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ROLEPLAY SCENARIOS VIEW */}
        {activeTab === 'scenarios' && (
          <div className="h-full max-w-4xl mx-auto overflow-y-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  Real-World Roleplay Scenarios
                </h2>
                <p className="text-white/40 text-xs">
                  Practice contextual speaking across business, travel, and high-stakes situations
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-xs">
                {['all', 'basic', 'intermediate', 'pro'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setScenarioFilter(lvl)}
                    className={`px-3 py-1 rounded-full uppercase tracking-wider text-[11px] font-medium transition-colors cursor-pointer ${
                      scenarioFilter === lvl
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'glass-pill text-white/40 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-8">
              {PRACTICE_SCENARIOS.filter(
                s => scenarioFilter === 'all' || s.level === scenarioFilter
              ).map(sc => {
                const isActive = activeScenario?.id === sc.id;
                const levelCfgItem = LEVEL_CONFIGS[sc.level];

                return (
                  <div
                    key={sc.id}
                    className={`p-5 rounded-3xl glass-panel border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'border-violet-500/60 bg-violet-500/[0.08] shadow-xl shadow-violet-500/10'
                        : 'border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-3xl p-2 rounded-2xl bg-white/[0.04] border border-white/[0.06]">{sc.icon}</span>
                        <span
                          className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${levelCfgItem.color}20`,
                            color: levelCfgItem.color,
                            border: `1px solid ${levelCfgItem.color}35`
                          }}
                        >
                          {sc.level}
                        </span>
                      </div>

                      <h3 className="font-semibold text-white text-base mt-3">
                        {sc.title}
                      </h3>
                      <p className="text-white/60 text-xs mt-1.5 leading-relaxed">
                        {sc.description}
                      </p>

                      <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                        {sc.targetKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/50 border border-white/[0.05]"
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
                      className={`mt-5 w-full py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                          : 'glass-pill hover:bg-white/[0.1] text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? 'Continue Session' : 'Start Scenario'}</span>
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
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-violet-400" />
                  <span>Personal Vocab Vault</span>
                </h2>
                <p className="text-white/40 text-xs">
                  {savedVocab.length} words saved from your real-time speaking turns
                </p>
              </div>

              {savedVocab.length > 0 && (
                <button
                  onClick={() => {
                    setSavedVocab([]);
                    localStorage.removeItem('english_vocab_vault');
                  }}
                  className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {savedVocab.length === 0 ? (
              <div className="text-center py-20 text-white/40 space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-white/20" />
                <p className="text-sm font-medium text-white/80">Your Vocab Vault is empty</p>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  During voice conversations, tap the bookmark icon on any Pro vocabulary upgrade in the Coaching tab to save it here for native pronunciation practice.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                {savedVocab.map(item => {
                  const lvlCfg = LEVEL_CONFIGS[item.level || 'intermediate'];
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl glass-panel border border-white/[0.08] flex flex-col justify-between group shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-base">
                            {item.word}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${lvlCfg.color}20`,
                              color: lvlCfg.color,
                              border: `1px solid ${lvlCfg.color}35`
                            }}
                          >
                            {item.level}
                          </span>
                        </div>

                        <p className="text-xs text-white/70 mt-2 leading-relaxed">
                          {item.meaning}
                        </p>

                        {item.example && (
                          <p className="text-xs text-violet-300/90 italic mt-2.5 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                            "{item.example}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <button
                          onClick={() => speak(item.word, 0.9)}
                          className="text-xs text-violet-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Pronounce</span>
                        </button>

                        <button
                          onClick={() => handleDeleteVocab(item.id)}
                          className="text-white/30 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
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
