"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { EnglishLevel } from '@/types/english-coach';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';

interface VoiceVisualizerOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  volumeLevel: number;
  level: EnglishLevel;
  onToggleMic: () => void;
  disabled?: boolean;
}

export default function VoiceVisualizerOrb({
  state,
  volumeLevel,
  level,
  onToggleMic,
  disabled = false
}: VoiceVisualizerOrbProps) {
  const levelConfig = LEVEL_CONFIGS[level];

  // Dynamic scale calculation based on live volume (0-100)
  const reactiveScale = state === 'listening' ? 1 + (volumeLevel / 100) * 0.45 : 1;

  // Determine glow colors based on state
  const getOrbGradient = () => {
    switch (state) {
      case 'listening':
        return 'from-emerald-400 via-teal-500 to-emerald-700 shadow-emerald-500/40';
      case 'thinking':
        return 'from-amber-400 via-orange-500 to-amber-600 shadow-amber-500/40';
      case 'speaking':
        return 'from-cyan-400 via-blue-500 to-indigo-600 shadow-blue-500/40';
      case 'idle':
      default:
        return 'from-zinc-700 via-zinc-800 to-zinc-900 shadow-zinc-800/30';
    }
  };

  const getStatusLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening to you...';
      case 'thinking':
        return 'Analyzing grammar & thinking...';
      case 'speaking':
        return 'AI Tutor speaking...';
      case 'idle':
      default:
        return 'Tap orb or press Space to speak';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative py-6">
      {/* Outer Ambient Glow Rings */}
      <div className="relative flex items-center justify-center">
        {/* Animated Background Ring 1 */}
        <motion.div
          animate={{
            scale: state === 'listening' ? [1, 1.25, 1] : state === 'speaking' ? [1, 1.15, 1] : 1,
            opacity: state === 'idle' ? 0.15 : 0.45,
          }}
          transition={{
            duration: state === 'listening' ? 1.5 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-56 h-56 rounded-full blur-2xl transition-colors duration-500"
          style={{
            backgroundColor:
              state === 'listening' ? '#10B981' :
              state === 'thinking' ? '#F59E0B' :
              state === 'speaking' ? '#3B82F6' : levelConfig.color
          }}
        />

        {/* Animated Secondary Ripple Ring */}
        {state === 'listening' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-44 h-44 rounded-full border border-emerald-400/50"
          />
        )}

        {state === 'speaking' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-44 h-44 rounded-full border border-blue-400/50"
          />
        )}

        {/* Central Clickable Orb */}
        <motion.button
          onClick={onToggleMic}
          disabled={disabled || state === 'thinking'}
          animate={{ scale: reactiveScale }}
          whileHover={{ scale: state === 'idle' ? 1.05 : reactiveScale }}
          whileTap={{ scale: 0.95 }}
          className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-br ${getOrbGradient()} p-[3px] shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed`}
          title={state === 'listening' ? 'Click to finish speaking' : 'Click to start speaking'}
        >
          {/* Inner Gloss & Shimmer Overlay */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/40 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            {state === 'listening' && (
              <div className="flex flex-col items-center gap-1.5 text-white">
                <Mic className="w-8 h-8 animate-bounce" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
                  Listening
                </span>
              </div>
            )}

            {state === 'thinking' && (
              <div className="flex flex-col items-center gap-1.5 text-amber-100">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
                  Thinking
                </span>
              </div>
            )}

            {state === 'speaking' && (
              <div className="flex flex-col items-center gap-1.5 text-white">
                <Volume2 className="w-8 h-8 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
                  Speaking
                </span>
              </div>
            )}

            {state === 'idle' && (
              <div className="flex flex-col items-center gap-1.5 text-zinc-300 group-hover:text-white">
                <Mic className="w-8 h-8" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
                  Tap to Talk
                </span>
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Audio Wave Bars Display when listening */}
      <div className="h-6 flex items-center gap-1 mt-5">
        {state === 'listening' ? (
          [...Array(9)].map((_, i) => {
            const barHeight = Math.max(4, Math.min(24, ((volumeLevel * (i + 1) * 3) % 24) + 4));
            return (
              <motion.span
                key={i}
                animate={{ height: barHeight }}
                transition={{ duration: 0.1 }}
                className="w-1 bg-emerald-400 rounded-full"
              />
            );
          })
        ) : state === 'speaking' ? (
          [...Array(7)].map((_, i) => (
            <motion.span
              key={i}
              animate={{ height: [6, 20, 8, 22, 6][i % 5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              className="w-1 bg-blue-400 rounded-full"
            />
          ))
        ) : (
          <span className="text-xs font-mono text-paper-dim tracking-wide">
            {getStatusLabel()}
          </span>
        )}
      </div>
    </div>
  );
}
