'use client';

import React, { useState } from 'react';
import { DeckViewMode } from '../types/note';
import { paperSound } from '../lib/audio';
import { Volume2, VolumeX, Plus, Command, LayoutGrid, Layers, Sparkles } from 'lucide-react';

interface NavbarProps {
  viewMode: DeckViewMode;
  onViewModeChange: (mode: DeckViewMode) => void;
  onNewNote: () => void;
  onOpenShortcuts: () => void;
  activeNoteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  onNewNote,
  onOpenShortcuts,
  activeNoteCount,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    paperSound.setSoundEnabled(!next);
    if (!next) {
      paperSound.playClickSound();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-desk-rule bg-desk/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-paper-lemon border border-dash-lemon/30 flex items-center justify-center text-sm shadow-sm">
              ✍️
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-ink">
                PaperDeck
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-desk-surface text-ink-muted border border-desk-rule">
                v1.2
              </span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-desk-surface border border-desk-rule">
            <button
              onClick={() => {
                onViewModeChange('deck');
                paperSound.playClickSound();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'deck'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Edge Deck</span>
            </button>

            <button
              onClick={() => {
                onViewModeChange('desk');
                paperSound.playClickSound();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'desk'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Desk Board</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-desk-surface hover:bg-desk-surface/80 border border-desk-rule text-ink-muted hover:text-ink transition-colors cursor-pointer"
            title={isMuted ? 'Unmute paper sounds' : 'Mute paper sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Shortcuts Guide */}
          <button
            onClick={onOpenShortcuts}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-desk-surface hover:bg-desk-surface/80 border border-desk-rule text-xs font-mono text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <Command className="w-3 h-3" />
            <span>Shortcuts</span>
          </button>

          {/* New Note Button */}
          <button
            onClick={() => {
              onNewNote();
              paperSound.playClickSound();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-desk font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Note</span>
            <kbd className="hidden sm:inline-block ml-1 bg-white/20 text-white border-transparent">
              ⌥⌘N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
