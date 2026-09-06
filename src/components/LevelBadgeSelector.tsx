"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnglishLevel } from '@/types/english-coach';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';
import { ShieldCheck, Zap, Award } from 'lucide-react';

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
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'intermediate':
        return <Zap className="w-3.5 h-3.5" />;
      case 'pro':
        return <Award className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-steel-1/90 border border-line rounded-xl p-1.5 flex items-center gap-1 shadow-inner">
      {levels.map(lvl => {
        const config = LEVEL_CONFIGS[lvl];
        const isSelected = currentLevel === lvl;

        return (
          <button
            key={lvl}
            onClick={() => onSelectLevel(lvl)}
            className={`relative flex-1 py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'text-white shadow-md'
                : 'text-paper-dim hover:text-paper hover:bg-steel-2/50'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="levelActivePill"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: config.color, opacity: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {getIcon(lvl)}
              <span className="capitalize">{lvl}</span>
              <span className="text-[10px] opacity-80 hidden sm:inline">({config.cefr})</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
