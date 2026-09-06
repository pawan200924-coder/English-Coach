"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Tag, Sparkles } from 'lucide-react';
import { PracticeScenario, EnglishLevel } from '@/types/english-coach';
import { PRACTICE_SCENARIOS } from '@/lib/english-coach/scenarios';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: PracticeScenario) => void;
  activeScenarioId?: string;
  initialLevel?: EnglishLevel;
}

export default function ScenarioModal({
  isOpen,
  onClose,
  onSelectScenario,
  activeScenarioId,
  initialLevel = 'basic'
}: ScenarioModalProps) {
  const [filterLevel, setFilterLevel] = useState<string>('all');

  if (!isOpen) return null;

  const filteredScenarios = PRACTICE_SCENARIOS.filter(s => {
    if (filterLevel === 'all') return true;
    return s.level === filterLevel;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-steel-1 border border-line rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="font-display text-lg text-paper uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-brand" />
                <span>Real-World Practice Scenarios</span>
              </h3>
              <p className="text-paper-dim text-xs font-mono mt-0.5">
                Practice specific conversational situations from survival English to executive debates
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-paper-dim hover:text-white p-1 rounded-lg hover:bg-steel-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-2 py-3 border-b border-line/50 overflow-x-auto text-xs font-mono">
            {['all', 'basic', 'intermediate', 'pro'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterLevel === lvl
                    ? 'bg-orange-brand text-white font-bold'
                    : 'bg-steel-2 text-paper-dim hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredScenarios.map(sc => {
              const isActive = activeScenarioId === sc.id;
              const levelCfg = LEVEL_CONFIGS[sc.level];

              return (
                <div
                  key={sc.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-orange-brand/10 border-orange-brand'
                      : 'bg-steel-2/60 border-line hover:border-paper-dim/40 hover:bg-steel-2'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl">{sc.icon}</span>
                      <span
                        className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${levelCfg.color}20`,
                          color: levelCfg.color,
                          border: `1px solid ${levelCfg.color}40`
                        }}
                      >
                        {sc.level}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm mt-2">{sc.title}</h4>
                    <p className="text-paper-dim text-xs mt-1 leading-relaxed">
                      {sc.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {sc.targetKeywords.slice(0, 4).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-steel-1 px-1.5 py-0.5 rounded text-paper-dim border border-line/60"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectScenario(sc);
                      onClose();
                    }}
                    className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-orange-brand text-white'
                        : 'bg-steel-1 border border-line text-paper hover:bg-orange-brand hover:text-white hover:border-transparent'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Current Scenario' : 'Start Scenario'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
