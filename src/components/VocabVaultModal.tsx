"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Bookmark, Trash2, Sparkles } from 'lucide-react';
import { EnglishLevel } from '@/types/english-coach';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';

export interface SavedVocabItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  level: EnglishLevel;
  dateAdded: string;
}

interface VocabVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedVocabItem[];
  onPronounceWord: (word: string) => void;
  onDeleteWord: (id: string) => void;
}

export default function VocabVaultModal({
  isOpen,
  onClose,
  savedWords,
  onPronounceWord,
  onDeleteWord
}: VocabVaultModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-steel-1 border border-line rounded-2xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="font-display text-lg text-paper uppercase tracking-wide flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-orange-brand" />
                <span>Personal Vocab Vault</span>
              </h3>
              <p className="text-paper-dim text-xs font-mono mt-0.5">
                {savedWords.length} Pro & advanced expressions saved from your conversations
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-paper-dim hover:text-white p-1 rounded-lg hover:bg-steel-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Words List */}
          <div className="py-4 max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
            {savedWords.length === 0 ? (
              <div className="text-center py-10 text-paper-dim space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-paper-dim/40" />
                <p className="text-sm font-medium">No saved words yet</p>
                <p className="text-xs">
                  During conversations, tap the bookmark icon on any vocabulary upgrade to store it here.
                </p>
              </div>
            ) : (
              savedWords.map(item => {
                const lvlCfg = LEVEL_CONFIGS[item.level || 'intermediate'];
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-steel-2/70 border border-line flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base tracking-wide">
                          {item.word}
                        </span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold"
                          style={{
                            backgroundColor: `${lvlCfg.color}20`,
                            color: lvlCfg.color,
                            border: `1px solid ${lvlCfg.color}40`
                          }}
                        >
                          {item.level}
                        </span>
                        <button
                          onClick={() => onPronounceWord(item.word)}
                          className="text-paper-dim hover:text-orange-brand transition-colors p-1"
                          title="Hear pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-paper-dim">{item.meaning}</p>

                      {item.example && (
                        <p className="text-xs text-orange-brand/90 italic font-mono mt-1">
                          "{item.example}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteWord(item.id)}
                      className="text-paper-dim/40 hover:text-red-400 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove word"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
