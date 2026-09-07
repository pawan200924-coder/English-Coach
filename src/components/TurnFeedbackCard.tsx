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
  ArrowRight,
  Copy
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
  const [copied, setCopied] = useState(false);
  const feedback = turn.feedback;
  const isTutor = turn.speaker === 'tutor';

  const handleSaveWord = (word: string, meaning: string, example: string) => {
    if (onSaveVocab) {
      onSaveVocab(word, meaning, example);
      setSavedWords(prev => ({ ...prev, [word]: true }));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isTutor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 my-3 max-w-2xl"
      >
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20 shrink-0">
          <div className="w-full h-full rounded-[14px] bg-[#0C0F18] flex items-center justify-center font-bold text-xs text-white">
            AI
          </div>
        </div>
        <div className="flex-1 glass-panel rounded-3xl rounded-tl-sm p-4 shadow-xl border border-white/[0.09] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-violet-300">
                FluentVoice Tutor
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            
            <button
              onClick={() => onReplayAudio(turn.text)}
              className="text-white/50 hover:text-white transition-all px-2.5 py-1 rounded-full glass-pill flex items-center gap-1.5 text-xs cursor-pointer hover:border-violet-500/30"
              title="Listen again"
            >
              <Volume2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px] font-medium">Replay</span>
            </button>
          </div>
          
          <p className="text-white/90 text-sm leading-relaxed font-sans relative z-10">{turn.text}</p>
        </div>
      </motion.div>
    );
  }

  // User Turn with Feedback Deck
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-5 ml-auto max-w-2xl space-y-2.5"
    >
      {/* User Bubble */}
      <div className="flex items-start justify-end gap-2.5">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-xl max-w-lg border border-white/10">
          <p className="text-sm font-medium leading-relaxed">{turn.text}</p>
          <span className="text-[10px] text-white/60 mt-1.5 block text-right font-mono">
            {turn.timestamp}
          </span>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0 text-sm shadow-md">
          👤
        </div>
      </div>

      {/* AI Coaching Insights Card */}
      {feedback && (
        <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/[0.1] space-y-4 text-xs relative overflow-hidden">
          {/* Subtle Ambient Gradient Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-500/10 via-cyan-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Header Score Pill */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07] relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 font-sans">
                Fluency Analysis
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-300/80 text-[10px] font-medium">Fluency:</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">{feedback.fluencyScore}%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-cyan-300/80 text-[10px] font-medium">Grammar:</span>
                <span className="font-bold text-cyan-400 font-mono text-xs">{feedback.grammarScore}%</span>
              </div>
            </div>
          </div>

          {/* Pro Level Phrasing Banner (Executive Styling) */}
          {feedback.proAlternative && (
            <div className="relative rounded-2xl p-4 bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent border border-violet-500/35 shadow-lg overflow-hidden group">
              <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                <div className="flex items-center gap-1.5 text-violet-300 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                  <span className="tracking-wide">Pro Native Alternative</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(feedback.proAlternative)}
                    className="text-violet-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-violet-500/20 cursor-pointer"
                    title={copied ? "Copied!" : "Copy phrase"}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onReplayAudio(feedback.proAlternative)}
                    className="text-violet-300 hover:text-white transition-all flex items-center gap-1 text-[11px] bg-violet-500/25 hover:bg-violet-500/40 px-2.5 py-1 rounded-full cursor-pointer border border-violet-400/30"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Hear Accent</span>
                  </button>
                </div>
              </div>
              <p className="text-white text-xs sm:text-sm font-medium italic leading-relaxed relative z-10">
                "{feedback.proAlternative}"
              </p>
            </div>
          )}

          {/* Grammar & Usage Corrections */}
          {feedback.grammarTips && feedback.grammarTips.length > 0 && (
            <div className="bg-amber-500/[0.08] border border-amber-500/25 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Grammar Repair</span>
              </div>
              
              {feedback.grammarTips.map((tip, idx) => (
                <div key={idx} className="border-l-2 border-amber-400/70 pl-3 py-0.5 space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                    <span className="line-through text-rose-300/90 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      {tip.original}
                    </span>
                    <ArrowRight className="w-3 h-3 text-white/40 shrink-0" />
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {tip.correction}
                    </span>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed font-sans">
                    {tip.reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {feedback.vocabularyUpgrades && feedback.vocabularyUpgrades.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Executive Vocabulary Upgrades</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {feedback.vocabularyUpgrades.map((item, idx) => {
                  const isSaved = savedWords[item.upgraded];
                  return (
                    <div
                      key={idx}
                      className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-3 flex items-start justify-between gap-2.5 transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/40 line-through text-[11px] font-mono">{item.original}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-white/30" />
                          <span className="text-cyan-300 font-bold text-xs">{item.upgraded}</span>
                        </div>
                        <p className="text-white/60 text-[10px] leading-relaxed">{item.explanation}</p>
                      </div>

                      {onSaveVocab && (
                        <button
                          onClick={() => handleSaveWord(item.upgraded, item.explanation, feedback.proAlternative)}
                          disabled={isSaved}
                          className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                            isSaved
                              ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30'
                              : 'text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]'
                          }`}
                          title={isSaved ? 'Saved to Vault' : 'Save to Vocab Vault'}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
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
            <div className="flex items-center gap-2 text-white/70 text-[11px] pt-1 border-t border-white/[0.05]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-snug">{feedback.overallImpression}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
