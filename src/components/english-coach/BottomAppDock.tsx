"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, Layers, Bookmark } from 'lucide-react';

export type AppTab = 'voice' | 'feed' | 'scenarios' | 'vault';

interface BottomAppDockProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  savedVocabCount: number;
  unreadTurnsCount?: number;
}

export default function BottomAppDock({
  activeTab,
  onTabChange,
  savedVocabCount,
  unreadTurnsCount = 0
}: BottomAppDockProps) {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'voice',
      label: 'Live Voice',
      icon: <Mic className="w-5 h-5" />
    },
    {
      id: 'feed',
      label: 'Feedback',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadTurnsCount > 0 ? unreadTurnsCount : undefined
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      icon: <Layers className="w-5 h-5" />
    },
    {
      id: 'vault',
      label: 'Vocab',
      icon: <Bookmark className="w-5 h-5" />,
      badge: savedVocabCount > 0 ? savedVocabCount : undefined
    }
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="App Navigation"
        className="pointer-events-auto bg-steel-1/90 backdrop-blur-xl border border-line/80 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1 max-w-md w-full justify-around ring-1 ring-white/10"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'text-white'
                  : 'text-paper-dim hover:text-paper hover:bg-steel-2/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockPill"
                  className="absolute inset-0 bg-gradient-to-r from-orange-brand to-orange-dim rounded-xl shadow-lg shadow-orange-brand/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-2.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-ink' : 'bg-orange-brand text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="relative z-10 text-[10px] font-mono uppercase tracking-wider font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
