"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Gauge, Mic, Sparkles, Check, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiApiKey: string;
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
  geminiApiKey,
  onSaveApiKey,
  speechRate,
  onSpeechRateChange,
  continuousMode,
  onToggleContinuous,
  voices,
  selectedVoice,
  onSelectVoice
}: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(geminiApiKey);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTempKey(geminiApiKey);
  }, [geminiApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

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
                Voice & AI Settings
              </h3>
              <p className="text-paper-dim text-xs font-mono mt-0.5">
                Customize speech rate, voice accents, and AI intelligence
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-paper-dim hover:text-white p-1 rounded-lg hover:bg-steel-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-5 text-sm">
            {/* Gemini API Key */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-mono text-xs text-orange-brand uppercase tracking-wider font-semibold">
                <Key className="w-3.5 h-3.5" />
                <span>Google Gemini API Key (Optional)</span>
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty for smart offline engine)"
                className="w-full bg-steel-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-paper-dim/40 font-mono focus:outline-none focus:border-orange-brand"
              />
              <p className="text-[11px] text-paper-dim flex items-start gap-1 mt-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-brand" />
                <span>
                  The app works 100% free with the built-in Smart Grammar Engine. Providing your Gemini key enables unlimited, deep contextual roleplay conversations.
                </span>
              </p>
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1.5">
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
                <span>0.7x (Slower / Clear)</span>
                <span>1.0x (Natural)</span>
                <span>1.3x (Fast / Native)</span>
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
                  className="w-full bg-steel-2 border border-line rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-brand"
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
                    Mic automatically re-opens after the tutor finishes speaking
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
              className="px-4 py-2 rounded-xl text-xs font-mono text-paper-dim hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-orange-brand hover:bg-orange-dim text-white flex items-center gap-1.5 transition-colors"
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
