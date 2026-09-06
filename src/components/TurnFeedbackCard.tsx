"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  BookmarkPlus,
  Check,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { ConversationTurn, EnglishLevel } from '@/types/english-coach';
import { LEVEL_CONFIGS } from '@/lib/english-coach/levels';

interface TurnFeedbackCardProps {
  turn: ConversationTurn;
  level: EnglishLevel;
  onReplayAudio: (text: string) => void;
  onSaveVocab?: (word: string, meaning: string, example: string) => void;
}

export default function TurnFeedbackCard({
  turn,
  level,
  onReplayAudio,
  onSaveVocab
}: TurnFeedbackCardProps) {
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});
  const feedback = turn.feedback;
  const isTutor = turn.speaker === 'tutor';
  const levelConfig = LEVEL_CONFIGS[level];

  const handleSaveWord = (word: string, meaning: string, example: string) => {
    if (onSaveVocab) {
      onSaveVocab(word, meaning, example);
      setSavedWords(prev => ({ ...prev, [word]: true }));
    }
  };

  if (isTutor) {
    return (
      <div className="flex items-start gap-3 my-3">
        <div className="w-8 h-8 rounded-full bg-steel-2 border border-line flex items-center justify-center shrink-0 text-base shadow-sm">
          🤖
        </div>
        <div className="flex-1 bg-steel-1/90 border border-line/60 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-mono text-xs text-orange-brand tracking-wider uppercase font-semibold">
              AI Tutor
            </span>
            <button
              onClick={() => onReplayAudio(turn.text)}
              className="text-paper-dim hover:text-white transition-colors p-1 rounded-md hover:bg-steel-2 flex items-center gap-1 text-xs font-mono"
              title="Listen again"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>
          <p className="text-paper text-sm md:text-base leading-relaxed">{turn.text}</p>
        </div>
      </div>
    );
  }

  // User turn with AI coaching breakdown
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 bg-steel-1/80 border border-line rounded-2xl overflow-hidden shadow-xl"
    >
      {/* User Spoken Header */}
      <div className="p-4 bg-steel-2/50 border-b border-line/50 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-brand/20 border border-orange-brand/40 flex items-center justify-center shrink-0 text-sm">
            👤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-paper-dim tracking-wider uppercase">
                You Spoke
              </span>
              <span className="text-[10px] font-mono text-paper-dim/60">
                {turn.timestamp}
              </span>
            </div>
            <p className="text-white font-medium text-sm md:text-base mt-1">
              "{turn.text}"
            </p>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-paper-dim uppercase">Fluency</span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {feedback.fluencyScore}%
              </span>
            </div>
            <div className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
              {Math.round((feedback.fluencyScore + feedback.grammarScore + feedback.vocabularyScore) / 3)}
            </div>
          </div>
        )}
      </div>

      {/* Coaching Insights & Pro Alternatives */}
      {feedback && (
        <div className="p-4 space-y-4 text-xs md:text-sm">
          {/* Pro Rephrasing Banner */}
          {feedback.proAlternative && (
            <div className="bg-gradient-to-r from-orange-brand/10 via-steel-2 to-steel-1 border border-orange-brand/30 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-orange-brand font-semibold text-xs uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Pro Level Phrasing</span>
                </div>
                <button
                  onClick={() => onReplayAudio(feedback.proAlternative)}
                  className="text-orange-brand hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono bg-orange-brand/10 hover:bg-orange-brand/30 px-2 py-0.5 rounded"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Hear Native Accent</span>
                </button>
              </div>
              <p className="text-paper font-sans text-sm md:text-base italic leading-relaxed">
                "{feedback.proAlternative}"
              </p>
            </div>
          )}

          {/* Grammar Repairs */}
          {feedback.grammarTips && feedback.grammarTips.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono text-xs uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Grammar & Usage Correction</span>
              </div>
              <div className="space-y-2">
                {feedback.grammarTips.map((tip, idx) => (
                  <div key={idx} className="border-l-2 border-amber-400 pl-2.5">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-red-300 font-mono">{tip.original}</span>
                      <span className="text-paper-dim">→</span>
                      <span className="text-emerald-400 font-bold font-mono">{tip.correction}</span>
                    </div>
                    <p className="text-paper-dim text-[11px] mt-0.5 leading-normal">
                      {tip.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {feedback.vocabularyUpgrades && feedback.vocabularyUpgrades.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold font-mono text-xs uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Vocabulary Upgrades</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {feedback.vocabularyUpgrades.map((item, idx) => {
                  const isSaved = savedWords[item.upgraded];
                  return (
                    <div
                      key={idx}
                      className="bg-steel-2 border border-line/60 rounded-lg p-2.5 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-paper-dim line-through text-[11px]">{item.original}</span>
                          <span className="text-paper-dim text-[11px]">→</span>
                          <span className="text-white font-bold text-xs text-blue-300">{item.upgraded}</span>
                        </div>
                        <p className="text-paper-dim text-[10px] mt-1">{item.explanation}</p>
                      </div>

                      {onSaveVocab && (
                        <button
                          onClick={() => handleSaveWord(item.upgraded, item.explanation, feedback.proAlternative)}
                          disabled={isSaved}
                          className={`p-1 rounded transition-colors shrink-0 ${
                            isSaved
                              ? 'text-emerald-400 bg-emerald-500/20'
                              : 'text-paper-dim hover:text-white hover:bg-steel-1'
                          }`}
                          title={isSaved ? 'Saved to Vocab Vault' : 'Save to Vocab Vault'}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filler Word Badges */}
          {feedback.fillerWords && feedback.fillerWords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-paper-dim">
              <span className="text-amber-400/90 font-semibold">Filler words spotted:</span>
              {feedback.fillerWords.map((word, i) => (
                <span
                  key={i}
                  className="bg-amber-500/20 border border-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full"
                >
                  "{word}"
                </span>
              ))}
              <span className="text-paper-dim/70 text-[10px]">
                (Try pausing silently instead)
              </span>
            </div>
          )}

          {/* Overall Impression */}
          {feedback.overallImpression && (
            <div className="text-[12px] text-paper-dim bg-steel-2/40 rounded-lg px-3 py-2 italic flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feedback.overallImpression}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
