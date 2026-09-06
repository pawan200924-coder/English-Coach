"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Globe } from 'lucide-react';
import { TutorPersona, EnglishLevel } from '@/types/english-coach';
import { TUTOR_PERSONAS } from '@/lib/english-coach/personas';

interface PersonaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: TutorPersona;
  onSelectPersona: (persona: TutorPersona) => void;
  currentLevel: EnglishLevel;
}

export default function PersonaSelectorModal({
  isOpen,
  onClose,
  selectedPersona,
  onSelectPersona,
  currentLevel
}: PersonaSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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
                Select Your AI Tutor
              </h3>
              <p className="text-paper-dim text-xs font-mono mt-0.5">
                Choose the voice, accent, and teaching persona for your session
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-paper-dim hover:text-white p-1 rounded-lg hover:bg-steel-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Persona List */}
          <div className="grid grid-cols-1 gap-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
            {TUTOR_PERSONAS.map(p => {
              const isSelected = selectedPersona.id === p.id;
              const isRecommended = p.recommendedLevel === currentLevel;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-orange-brand/10 border-orange-brand'
                      : 'bg-steel-2/60 border-line hover:border-paper-dim/40 hover:bg-steel-2'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl p-1 bg-steel-1 rounded-xl border border-line shrink-0">
                      {p.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-steel-1 border border-line text-paper-dim">
                          {p.accent} Accent
                        </span>
                        {isRecommended && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-orange-brand/90 font-mono mt-0.5">
                        {p.role}
                      </p>
                      <p className="text-xs text-paper-dim mt-1.5 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-orange-brand flex items-center justify-center text-white shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
