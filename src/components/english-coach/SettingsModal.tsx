"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Gauge, Mic, Sparkles, Check, Info, Cpu, ExternalLink } from 'lucide-react';
import { AIProvider } from '@/lib/english-coach/modelProviders';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  continuousMode: boolean;
  onToggleContinuous: (enabled: boolean) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  provider,
  onProviderChange,
  apiKey,
  onSaveApiKey,
  speechRate,
  onSpeechRateChange,
  continuousMode,
  onToggleContinuous,
  voices,
  selectedVoice,
  onSelectVoice
}: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempProvider, setTempProvider] = useState<AIProvider>(provider);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTempKey(apiKey);
    setTempProvider(provider);
  }, [apiKey, provider]);

  if (!isOpen) return null;

  const handleSave = () => {
    onProviderChange(tempProvider);
    onSaveApiKey(tempKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const getProviderHelperText = () => {
    switch (tempProvider) {
      case 'groq':
        return {
          title: 'Groq Cloud (Llama 3.3 70B - Ultra Fast)',
          desc: 'Free high-speed open-source Llama 3.3 70B inference with sub-second voice turns.',
          link: 'https://console.groq.com/keys',
          linkText: 'Get free Groq API key'
        };
      case 'gemini':
        return {
          title: 'Google Gemini 1.5/2.0 Flash',
          desc: 'Generous free tier with 1,500 daily requests from Google AI Studio.',
          link: 'https://aistudio.google.com/app/apikey',
          linkText: 'Get free Gemini API key'
        };
      case 'huggingface':
        return {
          title: 'Hugging Face Serverless (Mistral 7B / Qwen 2.5)',
          desc: 'Free serverless inference on open-source community language models.',
          link: 'https://huggingface.co/settings/tokens',
          linkText: 'Get free HF access token'
        };
      case 'offline':
      default:
        return {
          title: 'Smart In-Browser Engine (Cambridge CEFR Dataset)',
          desc: '100% free and works offline. Trained on 50+ ESL error patterns from Cambridge/FCE datasets.',
          link: '',
          linkText: ''
        };
    }
  };

  const helper = getProviderHelperText();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-steel-1 border border-line rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="font-display text-lg text-paper uppercase tracking-wide">
                AI Models & Speech Settings
              </h3>
              <p className="text-paper-dim text-xs font-mono mt-0.5">
                Choose your free open-source AI engine, speech speed, and audio accents
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-paper-dim hover:text-white p-1 rounded-lg hover:bg-steel-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 text-sm max-h-[65vh] overflow-y-auto pr-1">
            {/* AI Provider Selector */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-mono text-xs text-orange-brand uppercase tracking-wider font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Model Provider</span>
              </label>
              <select
                value={tempProvider}
                onChange={e => setTempProvider(e.target.value as AIProvider)}
                className="w-full bg-steel-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-orange-brand cursor-pointer"
              >
                <option value="offline">⚡ Smart In-Browser Engine (100% Free • Cambridge CEFR Trained)</option>
                <option value="groq">🚀 Groq Cloud (Free • Llama 3.3 70B & Whisper)</option>
                <option value="gemini">✨ Google Gemini Flash (Free Tier • 1500 req/day)</option>
                <option value="huggingface">🤗 Hugging Face Serverless (Free • Mistral 7B)</option>
              </select>
            </div>

            {/* API Key Input (if cloud provider chosen) */}
            {tempProvider !== 'offline' && (
              <div className="space-y-1.5 bg-steel-2/50 p-3 rounded-xl border border-line">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-paper uppercase tracking-wider font-semibold">
                    {tempProvider === 'groq' ? 'Groq API Key' : tempProvider === 'gemini' ? 'Gemini API Key' : 'Hugging Face Token'}
                  </label>
                  {helper.link && (
                    <a
                      href={helper.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-brand hover:underline text-[11px] font-mono flex items-center gap-1"
                    >
                      <span>{helper.linkText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={tempKey}
                  onChange={e => setTempKey(e.target.value)}
                  placeholder={`Paste your ${tempProvider} key here...`}
                  className="w-full bg-steel-1 border border-line rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-brand"
                />
                <p className="text-[11px] text-paper-dim leading-relaxed">
                  {helper.desc}
                </p>
              </div>
            )}

            {tempProvider === 'offline' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero Setup • Cambridge CEFR & GEC Trained</span>
                </div>
                <p className="text-paper-dim">
                  Trained on 50+ ESL error patterns from the Cambridge learner corpus and CEFR vocabulary benchmarks. Operates completely in your browser with zero latency and zero server fees.
                </p>
              </div>
            )}

            {/* Speech Rate Slider */}
            <div className="space-y-1.5 pt-2 border-t border-line/60">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-mono text-xs text-paper uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-orange-brand" />
                  <span>Tutor Speaking Speed</span>
                </label>
                <span className="font-mono text-xs text-orange-brand font-bold">
                  {speechRate}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={speechRate}
                onChange={e => onSpeechRateChange(parseFloat(e.target.value))}
                className="w-full accent-orange-brand cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-paper-dim">
                <span>0.7x (Clear/Slow)</span>
                <span>1.0x (Natural)</span>
                <span>1.3x (Native Fast)</span>
              </div>
            </div>

            {/* System Audio Voice Selector */}
            {voices.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-paper uppercase tracking-wider block">
                  Device Speech Voice
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={e => {
                    const match = voices.find(v => v.name === e.target.value);
                    if (match) onSelectVoice(match);
                  }}
                  className="w-full bg-steel-2 border border-line rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-brand cursor-pointer"
                >
                  {voices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Continuous Hands-Free Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-steel-2/60 border border-line">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-orange-brand" />
                <div>
                  <div className="text-xs font-bold text-white">Hands-Free Continuous Mode</div>
                  <div className="text-[10px] text-paper-dim">
                    Mic automatically listens whenever the tutor stops speaking
                  </div>
                </div>
              </div>
              <button
                onClick={() => onToggleContinuous(!continuousMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  continuousMode ? 'bg-orange-brand' : 'bg-steel-1 border border-line'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    continuousMode ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-paper-dim hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-orange-brand hover:bg-orange-dim text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-brand/20"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
