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

  // Dynamic scale response driven by live microphone volume with smooth dampening
  const reactiveScale = state === 'listening' ? 1 + (volumeLevel / 100) * 0.4 : 1;

  // Luminous gradient styles for each state
  const getTheme = () => {
    switch (state) {
      case 'listening':
        return {
          glowColor: 'rgba(16, 185, 129, 0.45)',
          outerRing: 'border-emerald-400/35',
          coreGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
          plasmaGradient: 'radial-gradient(circle at 35% 30%, #34d399, #0d9488 45%, #042f2e 90%)',
          shadow: 'shadow-[0_0_90px_rgba(16,185,129,0.55)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
          barGradient: 'from-emerald-400 via-teal-400 to-cyan-300',
          label: 'Listening to you • Speak naturally'
        };
      case 'thinking':
        return {
          glowColor: 'rgba(245, 158, 11, 0.45)',
          outerRing: 'border-amber-400/35',
          coreGradient: 'from-amber-400 via-orange-500 to-rose-500',
          plasmaGradient: 'radial-gradient(circle at 35% 30%, #fbbf24, #f97316 45%, #451a03 90%)',
          shadow: 'shadow-[0_0_90px_rgba(245,158,11,0.55)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          barGradient: 'from-amber-400 to-orange-400',
          label: 'Analyzing fluency & grammar...'
        };
      case 'speaking':
        return {
          glowColor: 'rgba(56, 189, 248, 0.5)',
          outerRing: 'border-cyan-400/35',
          coreGradient: 'from-cyan-400 via-indigo-500 to-violet-600',
          plasmaGradient: 'radial-gradient(circle at 35% 30%, #38bdf8, #6366f1 45%, #1e1b4b 90%)',
          shadow: 'shadow-[0_0_90px_rgba(56,189,248,0.6)]',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          barGradient: 'from-cyan-400 via-sky-400 to-indigo-400',
          label: 'AI Tutor is speaking...'
        };
      case 'idle':
      default:
        return {
          glowColor: 'rgba(139, 92, 246, 0.3)',
          outerRing: 'border-violet-500/25',
          coreGradient: 'from-violet-500 via-indigo-600 to-cyan-600',
          plasmaGradient: 'radial-gradient(circle at 35% 30%, #a78bfa, #6366f1 45%, #0f172a 90%)',
          shadow: 'shadow-[0_0_70px_rgba(139,92,246,0.4)]',
          badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
          barGradient: 'from-violet-500 to-indigo-400',
          label: 'Tap sphere or press Space to speak'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="flex flex-col items-center justify-center relative py-6 select-none">
      {/* 3D Glass Visualizer Container */}
      <div className="relative flex items-center justify-center w-80 h-80">
        
        {/* Layer 1: Ambient Ultra-Soft Radial Halo */}
        <motion.div
          animate={{
            scale: state === 'listening' ? [1, 1.35, 1] : state === 'speaking' ? [1, 1.25, 1] : [1, 1.08, 1],
            opacity: state === 'idle' ? 0.35 : 0.7,
          }}
          transition={{
            duration: state === 'listening' ? 1.5 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-72 h-72 rounded-full blur-3xl transition-colors duration-700 pointer-events-none"
          style={{ backgroundColor: theme.glowColor }}
        />

        {/* Layer 2: Rotating Orbital Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`absolute w-64 h-64 rounded-full border border-dashed ${theme.outerRing} pointer-events-none opacity-40`}
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute w-72 h-72 rounded-full border border-white/[0.04] pointer-events-none"
        />

        {/* Dynamic Concentric Sound Ripples when Listening */}
        {state === 'listening' && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute w-48 h-48 rounded-full border ${theme.outerRing} pointer-events-none`}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 2.0, repeat: Infinity, ease: 'easeOut', delay: 0.45 }}
              className={`absolute w-48 h-48 rounded-full border ${theme.outerRing} pointer-events-none`}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.9 }}
              className={`absolute w-48 h-48 rounded-full border ${theme.outerRing} pointer-events-none`}
            />
          </>
        )}

        {/* Dynamic Pulsing Halo when Speaking */}
        {state === 'speaking' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-48 h-48 rounded-full border border-cyan-400/30 pointer-events-none"
          />
        )}

        {/* Orbiting Satellite Star in Thinking State */}
        {state === 'thinking' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            className="absolute w-60 h-60 rounded-full pointer-events-none"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_15px_#fbbf24] absolute -top-1.5 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}

        {/* Central 3D Glass Plasma Orb Button */}
        <motion.button
          onClick={onToggleMic}
          disabled={disabled || state === 'thinking'}
          animate={{ scale: reactiveScale }}
          whileHover={{ scale: state === 'idle' ? 1.05 : reactiveScale }}
          whileTap={{ scale: 0.94 }}
          className={`relative z-10 w-44 h-44 rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed ${theme.shadow}`}
          title={state === 'listening' ? 'Click to finish speaking' : 'Click or press Spacebar to talk'}
        >
          {/* Glass Outer Rim Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-white/30 via-white/5 to-black/40 p-[1.5px] pointer-events-none">
            <div className="w-full h-full rounded-full bg-transparent" />
          </div>

          {/* Living 3D Plasma Sphere Interior */}
          <div
            className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center"
            style={{ background: theme.plasmaGradient }}
          >
            {/* Organic Plasma Fluid Motion */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.18, 0.95, 1]
              }}
              transition={{
                rotate: { duration: 14, repeat: Infinity, ease: 'linear' },
                scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="absolute -inset-4 rounded-full bg-gradient-to-tr from-white/25 via-transparent to-black/40 blur-md pointer-events-none"
            />

            {/* Specular 3D Glass Highlight Dome */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0.15)_35%,transparent_65%)] pointer-events-none" />

            {/* Bottom Inner Shadow Rim (adds physical glass sphere depth) */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.7)_0%,transparent_60%)] pointer-events-none" />

            {/* Center Icon & Status Visual */}
            <div className="relative z-20 flex flex-col items-center justify-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {state === 'listening' && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative">
                    <Mic className="w-9 h-9 text-emerald-100 stroke-[2.5]" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-200 font-sans">
                    Listening
                  </span>
                </div>
              )}

              {state === 'thinking' && (
                <div className="flex flex-col items-center gap-1.5">
                  <Loader2 className="w-9 h-9 animate-spin text-amber-200 stroke-[2.5]" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-200 font-sans">
                    Analyzing
                  </span>
                </div>
              )}

              {state === 'speaking' && (
                <div className="flex flex-col items-center gap-1.5">
                  <Volume2 className="w-9 h-9 animate-pulse text-cyan-100 stroke-[2.5]" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-200 font-sans">
                    Speaking
                  </span>
                </div>
              )}

              {state === 'idle' && (
                <div className="flex flex-col items-center gap-1.5 group-hover:scale-105 transition-transform">
                  <Mic className="w-9 h-9 text-white/95 stroke-[2.3]" />
                  <span className="text-[12px] font-semibold tracking-wide text-white/95 font-sans">
                    Tap to Speak
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.button>
      </div>

      {/* 16-Bar Precision Responsive Audio Waveform Equalizer */}
      <div className="h-10 flex items-center justify-center gap-1 mt-3 px-6">
        {state === 'listening' ? (
          // Dynamic 16-bar acoustic bell-curve equalizer
          [...Array(16)].map((_, i) => {
            const distanceToCenter = Math.abs(i - 7.5) / 7.5;
            const curveFactor = 1 - distanceToCenter * 0.55;
            const dynamicHeight = Math.max(
              4,
              Math.min(34, ((volumeLevel * (i + 1) * 1.8) % 30) * curveFactor + 4)
            );

            return (
              <motion.span
                key={i}
                animate={{ height: dynamicHeight }}
                transition={{ duration: 0.07, ease: 'linear' }}
                className={`w-1 rounded-full bg-gradient-to-t ${theme.barGradient} shadow-[0_0_8px_rgba(16,185,129,0.4)]`}
              />
            );
          })
        ) : state === 'speaking' ? (
          // Fluid undulating sine wave
          [...Array(16)].map((_, i) => {
            const pattern = [8, 16, 26, 32, 28, 20, 12, 6, 10, 22, 30, 34, 24, 18, 10, 6];
            return (
              <motion.span
                key={i}
                animate={{
                  height: [
                    pattern[i % pattern.length],
                    pattern[(i + 4) % pattern.length],
                    pattern[(i + 8) % pattern.length],
                    pattern[i % pattern.length]
                  ]
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.05
                }}
                className={`w-1 rounded-full bg-gradient-to-t ${theme.barGradient} shadow-[0_0_8px_rgba(56,189,248,0.4)]`}
              />
            );
          })
        ) : (
          <div className="glass-pill px-4 py-1.5 rounded-full text-xs text-white/70 font-sans flex items-center gap-2 shadow-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span>{theme.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
