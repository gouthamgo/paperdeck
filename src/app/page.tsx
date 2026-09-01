'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { EdgeDeck } from '../components/EdgeDeck';
import { DeskBoard } from '../components/DeskBoard';
import { NoteEditor } from '../components/NoteEditor';
import { ShareNoteModal } from '../components/ShareNoteModal';
import { ShortcutsModal } from '../components/ShortcutsModal';
import { NoteItem, DeckViewMode, NOTE_COLORS } from '../types/note';
import { getStoredNotes, saveNotes } from '../lib/noteStore';
import { paperSound } from '../lib/audio';
import { ArrowRight, Layers, LayoutGrid, Sparkles, Pin } from 'lucide-react';

export default function HomePage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [viewMode, setViewMode] = useState<DeckViewMode>('deck');
  const [activeFocusNote, setActiveFocusNote] = useState<NoteItem | null>(null);
  const [shareModalNote, setShareModalNote] = useState<NoteItem | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    setNotes(getStoredNotes());
  }, []);

  const handleUpdateNote = (updated: NoteItem) => {
    const next = notes.map(n => n.id === updated.id ? updated : n);
    setNotes(next);
    saveNotes(next);
    if (activeFocusNote?.id === updated.id) {
      setActiveFocusNote(updated);
    }
  };

  const handleDeleteNote = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    saveNotes(next);
    if (activeFocusNote?.id === id) {
      setActiveFocusNote(null);
    }
  };

  const handleNewNote = () => {
    const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].name;
    const randomTilt = (Math.random() * 6 - 3);

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      body: '☐ ',
      colorName: randomColor,
      isPinned: false,
      isArchived: false,
      tilt: parseFloat(randomTilt.toFixed(1)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newNote, ...notes];
    setNotes(next);
    saveNotes(next);
    setActiveFocusNote(newNote);
    paperSound.playPaperFanSound();
  };

  // Global Keyboard Shortcuts (⌥⌘N for New Note, ⌥⌘A for All Notes / Desk View)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌥⌘N -> New Note
      if (e.altKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewNote();
      }

      // ⌥⌘A -> Toggle All Notes (Desk View)
      if (e.altKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setViewMode(prev => prev === 'desk' ? 'deck' : 'desk');
        paperSound.playPaperFanSound();
      }

      // Esc -> Close focus note
      if (e.key === 'Escape' && activeFocusNote) {
        setActiveFocusNote(null);
        paperSound.playClickSound();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [notes, activeFocusNote]);

  return (
    <main className="min-h-screen flex flex-col justify-between desk-surface-bg relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewNote={handleNewNote}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        activeNoteCount={notes.filter(n => !n.isArchived).length}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col justify-center">
        {viewMode === 'desk' ? (
          /* 1. DESK BOARD VIEW (All Notes Scattered on Desk) */
          <div className="animate-fadeIn">
            <DeskBoard
              notes={notes}
              onSelectNote={(note) => setActiveFocusNote(note)}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onNewNote={handleNewNote}
              onShareNote={(note) => setShareModalNote(note)}
            />
          </div>
        ) : (
          /* 2. EDGE DECK VIEW (Clean Distraction-Free Focus Surface) */
          <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center animate-fadeIn select-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-desk-surface border border-desk-rule text-xs font-mono text-ink-muted mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Edge Dock Mode Active</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink tracking-tight leading-tight">
              Zero screen footprint.<br />
              <span className="font-hand text-3xl sm:text-5xl text-ink-muted font-normal">
                Notes that live at the edge of your screen.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-ink-muted mt-4 max-w-lg leading-relaxed">
              Slide your mouse pointer to the <strong className="text-ink font-semibold">right edge of your screen 👉</strong> to fan out your paper tabs.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setViewMode('desk');
                  paperSound.playPaperFanSound();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-desk-surface hover:bg-white border border-desk-rule text-xs font-bold text-ink transition-all shadow-sm cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Open All Notes / Desk (⌥⌘A)</span>
              </button>

              <button
                onClick={handleNewNote}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-desk text-xs font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Quick Note (⌥⌘N)</span>
              </button>
            </div>
          </div>
        )}

        {/* ALWAYS-ACTIVE SCREEN-EDGE DECK */}
        <EdgeDeck
          notes={notes}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onNewNote={handleNewNote}
          onShareNote={(note) => setShareModalNote(note)}
          onOpenAllNotes={() => setViewMode('desk')}
        />
      </div>

      {/* FOCUS MODAL */}
      {activeFocusNote && (
        <div
          onClick={() => setActiveFocusNote(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
            <NoteEditor
              note={activeFocusNote}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onClose={() => setActiveFocusNote(null)}
              onShare={(note) => setShareModalNote(note)}
            />
          </div>
        </div>
      )}

      {/* Share Note Modal */}
      <ShareNoteModal
        note={shareModalNote}
        isOpen={!!shareModalNote}
        onClose={() => setShareModalNote(null)}
      />

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="w-full py-6 border-t border-desk-rule text-center text-xs font-mono text-ink-subtle">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PaperDeck · Tactile paper notes at the edge of your screen</span>
          <span>100% Offline-First · Encrypted local storage</span>
        </div>
      </footer>
    </main>
  );
}
