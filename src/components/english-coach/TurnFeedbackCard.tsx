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
  ArrowRight
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

  const handleSaveWord = (word: string, meaning: string, example: string) => {
    if (onSaveVocab) {
      onSaveVocab(word, meaning, example);
      setSavedWords(prev => ({ ...prev, [word]: true }));
    }
  };

  if (isTutor) {
    return (
      <div className="flex items-start gap-3 my-3 max-w-2xl">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-md shadow-violet-500/20">
          AI
        </div>
        <div className="flex-1 glass-panel rounded-2xl rounded-tl-sm p-4 shadow-lg border border-white/[0.08]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-violet-400">
              AI Tutor
            </span>
            <button
              onClick={() => onReplayAudio(turn.text)}
              className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06] flex items-center gap-1 text-xs cursor-pointer"
              title="Listen again"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Replay</span>
            </button>
          </div>
          <p className="text-white/90 text-sm leading-relaxed font-sans">{turn.text}</p>
        </div>
      </div>
    );
  }

  // User Turn with Feedback Deck
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 ml-auto max-w-2xl"
    >
      {/* User Bubble */}
      <div className="flex items-start justify-end gap-2.5 mb-2">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg max-w-lg">
          <p className="text-sm font-medium leading-relaxed">{turn.text}</p>
          <span className="text-[10px] text-white/60 mt-1 block text-right">
            {turn.timestamp}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs">
          👤
        </div>
      </div>

      {/* AI Coaching Insights Card */}
      {feedback && (
        <div className="glass-panel rounded-2xl p-4 shadow-xl border border-white/[0.08] space-y-3.5 text-xs">
          {/* Header Score Pill */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Fluency Breakdown
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-white/50 text-[10px]">Fluency:</span>
                <span className="font-bold text-emerald-400 font-mono">{feedback.fluencyScore}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white/50 text-[10px]">Grammar:</span>
                <span className="font-bold text-cyan-400 font-mono">{feedback.grammarScore}%</span>
              </div>
            </div>
          </div>

          {/* Pro Level Phrasing Banner */}
          {feedback.proAlternative && (
            <div className="bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent border border-violet-500/30 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-violet-300 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Pro Native Phrasing</span>
                </div>
                <button
                  onClick={() => onReplayAudio(feedback.proAlternative)}
                  className="text-violet-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] bg-violet-500/20 hover:bg-violet-500/30 px-2 py-0.5 rounded-full cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Hear Accent</span>
                </button>
              </div>
              <p className="text-white/95 text-xs sm:text-sm italic leading-relaxed">
                "{feedback.proAlternative}"
              </p>
            </div>
          )}

          {/* Grammar & Usage Corrections */}
          {feedback.grammarTips && feedback.grammarTips.length > 0 && (
            <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Grammar Repair</span>
              </div>
              {feedback.grammarTips.map((tip, idx) => (
                <div key={idx} className="border-l-2 border-amber-400/60 pl-2.5 space-y-0.5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="line-through text-red-300/80">{tip.original}</span>
                    <ArrowRight className="w-3 h-3 text-white/40" />
                    <span className="text-emerald-400 font-bold">{tip.correction}</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-normal font-sans">
                    {tip.reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {feedback.vocabularyUpgrades && feedback.vocabularyUpgrades.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Vocabulary Enrichment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {feedback.vocabularyUpgrades.map((item, idx) => {
                  const isSaved = savedWords[item.upgraded];
                  return (
                    <div
                      key={idx}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/40 line-through text-[11px] font-mono">{item.original}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-white/30" />
                          <span className="text-cyan-300 font-bold text-xs">{item.upgraded}</span>
                        </div>
                        <p className="text-white/50 text-[10px] mt-1">{item.explanation}</p>
                      </div>

                      {onSaveVocab && (
                        <button
                          onClick={() => handleSaveWord(item.upgraded, item.explanation, feedback.proAlternative)}
                          disabled={isSaved}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                            isSaved
                              ? 'text-emerald-400 bg-emerald-500/20'
                              : 'text-white/40 hover:text-white hover:bg-white/[0.08]'
                          }`}
                          title={isSaved ? 'Saved to Vault' : 'Save to Vocab Vault'}
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

          {/* Overall Impression */}
          {feedback.overallImpression && (
            <div className="flex items-center gap-2 text-white/60 text-[11px] pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feedback.overallImpression}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
