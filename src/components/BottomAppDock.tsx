"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, Compass, Bookmark } from 'lucide-react';

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
      label: 'Live Call',
      icon: <Mic className="w-[19px] h-[19px]" />
    },
    {
      id: 'feed',
      label: 'Coaching',
      icon: <MessageSquare className="w-[19px] h-[19px]" />,
      badge: unreadTurnsCount > 0 ? unreadTurnsCount : undefined
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      icon: <Compass className="w-[19px] h-[19px]" />
    },
    {
      id: 'vault',
      label: 'Vocab',
      icon: <Bookmark className="w-[19px] h-[19px]" />,
      badge: savedVocabCount > 0 ? savedVocabCount : undefined
    }
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="App Navigation"
        className="pointer-events-auto glass-island rounded-full p-1.5 flex items-center gap-1 max-w-sm w-full justify-around shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 py-2 px-2 sm:px-3 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockPill"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600/80 via-indigo-600/80 to-cyan-600/70 rounded-full border border-white/20 shadow-lg shadow-violet-500/25"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                >
                  {tab.icon}
                </motion.div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-2 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-black shadow-md' : 'bg-violet-500 text-white shadow-sm'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="relative z-10 text-[10px] font-sans tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
