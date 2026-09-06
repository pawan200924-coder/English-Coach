"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Sparkles, Loader2 } from 'lucide-react';
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

  // Dynamic scale response driven by live microphone volume
  const reactiveScale = state === 'listening' ? 1 + (volumeLevel / 100) * 0.45 : 1;

  // Luminous gradient styles for each state
  const getGlowPalette = () => {
    switch (state) {
      case 'listening':
        return {
          glow: 'rgba(16, 185, 129, 0.4)',
          gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
          ring: 'border-emerald-400/40',
          shadow: 'shadow-[0_0_80px_rgba(16,185,129,0.5)]'
        };
      case 'thinking':
        return {
          glow: 'rgba(245, 158, 11, 0.4)',
          gradient: 'from-amber-400 via-orange-500 to-rose-500',
          ring: 'border-amber-400/40',
          shadow: 'shadow-[0_0_80px_rgba(245,158,11,0.5)]'
        };
      case 'speaking':
        return {
          glow: 'rgba(56, 189, 248, 0.45)',
          gradient: 'from-cyan-400 via-indigo-500 to-violet-600',
          ring: 'border-cyan-400/40',
          shadow: 'shadow-[0_0_80px_rgba(56,189,248,0.5)]'
        };
      case 'idle':
      default:
        return {
          glow: 'rgba(139, 92, 246, 0.25)',
          gradient: 'from-violet-500 via-indigo-600 to-cyan-600',
          ring: 'border-white/10',
          shadow: 'shadow-[0_0_60px_rgba(139,92,246,0.35)]'
        };
    }
  };

  const palette = getGlowPalette();

  const getStatusLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening to you...';
      case 'thinking':
        return 'Analyzing pronunciation & grammar...';
      case 'speaking':
        return 'AI Tutor is speaking...';
      case 'idle':
      default:
        return 'Tap sphere or press Space to speak';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative py-8 select-none">
      <div className="relative flex items-center justify-center w-72 h-72">
        {/* Ambient Outer Halo Blur */}
        <motion.div
          animate={{
            scale: state === 'listening' ? [1, 1.3, 1] : state === 'speaking' ? [1, 1.2, 1] : [1, 1.08, 1],
            opacity: state === 'idle' ? 0.35 : 0.65,
          }}
          transition={{
            duration: state === 'listening' ? 1.4 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-64 h-64 rounded-full blur-3xl transition-colors duration-700 pointer-events-none"
          style={{ backgroundColor: palette.glow }}
        />

        {/* Dynamic Ripple Wave Rings when active */}
        {state === 'listening' && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute w-44 h-44 rounded-full border ${palette.ring} pointer-events-none`}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              className={`absolute w-44 h-44 rounded-full border ${palette.ring} pointer-events-none`}
            />
          </>
        )}

        {state === 'speaking' && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-44 h-44 rounded-full border border-cyan-400/40 pointer-events-none"
          />
        )}

        {/* Orbiting Shimmer Halo in Thinking State */}
        {state === 'thinking' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute w-52 h-52 rounded-full border border-dashed border-amber-400/50 pointer-events-none"
          />
        )}

        {/* Central Fluid Voice Sphere Button */}
        <motion.button
          onClick={onToggleMic}
          disabled={disabled || state === 'thinking'}
          animate={{ scale: reactiveScale }}
          whileHover={{ scale: state === 'idle' ? 1.06 : reactiveScale }}
          whileTap={{ scale: 0.94 }}
          className={`relative z-10 w-40 h-40 rounded-full p-[2px] cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed ${palette.shadow}`}
          title={state === 'listening' ? 'Click to finish' : 'Click to talk'}
        >
          {/* Multi-layered radial mesh sphere */}
          <div className={`w-full h-full rounded-full bg-gradient-to-tr ${palette.gradient} relative overflow-hidden flex items-center justify-center`}>
            {/* Fluid inner radial lighting highlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_60%)]" />
            
            {/* Living organic fluid shimmer */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.15, 1]
              }}
              transition={{
                rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="absolute inset-2 rounded-full bg-gradient-to-br from-white/25 via-transparent to-black/30 blur-sm pointer-events-none"
            />

            {/* Center Icon & Live State Text */}
            <div className="relative z-20 flex flex-col items-center justify-center text-white drop-shadow-md">
              {state === 'listening' && (
                <div className="flex flex-col items-center gap-1">
                  <Mic className="w-8 h-8 animate-pulse text-white stroke-[2.5]" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-100 font-sans">
                    Listening
                  </span>
                </div>
              )}

              {state === 'thinking' && (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-100 stroke-[2.5]" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-100 font-sans">
                    Thinking
                  </span>
                </div>
              )}

              {state === 'speaking' && (
                <div className="flex flex-col items-center gap-1">
                  <Volume2 className="w-8 h-8 animate-pulse text-white stroke-[2.5]" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-100 font-sans">
                    Speaking
                  </span>
                </div>
              )}

              {state === 'idle' && (
                <div className="flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
                  <Mic className="w-8 h-8 text-white/90 stroke-[2.2]" />
                  <span className="text-[11px] font-medium tracking-wide text-white/90 font-sans">
                    Tap to Talk
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Real-time Audio Waveform Equalizer Display */}
      <div className="h-8 flex items-center justify-center gap-1.5 mt-2">
        {state === 'listening' ? (
          [...Array(11)].map((_, i) => {
            const barHeight = Math.max(5, Math.min(28, ((volumeLevel * (i + 1) * 2.5) % 28) + 4));
            return (
              <motion.span
                key={i}
                animate={{ height: barHeight }}
                transition={{ duration: 0.08 }}
                className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full"
              />
            );
          })
        ) : state === 'speaking' ? (
          [...Array(9)].map((_, i) => (
            <motion.span
              key={i}
              animate={{ height: [6, 24, 10, 26, 6][i % 5] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
              className="w-1 bg-gradient-to-t from-cyan-500 to-violet-400 rounded-full"
            />
          ))
        ) : (
          <div className="glass-pill px-4 py-1.5 rounded-full text-xs text-white/60 font-sans flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span>{getStatusLabel()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
