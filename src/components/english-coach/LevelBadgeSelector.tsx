"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnglishLevel } from '@/types/english-coach';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';
import { Sparkles, Zap, Award } from 'lucide-react';

interface LevelBadgeSelectorProps {
  currentLevel: EnglishLevel;
  onSelectLevel: (level: EnglishLevel) => void;
}

export default function LevelBadgeSelector({
  currentLevel,
  onSelectLevel
}: LevelBadgeSelectorProps) {
  const levels: EnglishLevel[] = ['basic', 'intermediate', 'pro'];

  const getIcon = (level: EnglishLevel) => {
    switch (level) {
      case 'basic':
        return <Sparkles className="w-3 h-3 text-emerald-400" />;
      case 'intermediate':
        return <Zap className="w-3 h-3 text-cyan-400" />;
      case 'pro':
        return <Award className="w-3 h-3 text-amber-400" />;
    }
  };

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-full p-1 flex items-center gap-0.5 shadow-inner">
      {levels.map(lvl => {
        const config = LEVEL_CONFIGS[lvl];
        const isSelected = currentLevel === lvl;

        return (
          <button
            key={lvl}
            onClick={() => onSelectLevel(lvl)}
            className={`relative flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              isSelected
                ? 'text-white'
                : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="levelActivePill"
                className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 font-sans">
              {getIcon(lvl)}
              <span className="capitalize">{lvl}</span>
              <span className="text-[10px] text-white/50 hidden sm:inline">({config.cefr})</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
