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

export default function HomePage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [viewMode, setViewMode] = useState<DeckViewMode>('desk');
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌥⌘N (Option + Meta + N) or Alt + Ctrl + N -> New Note
      if (e.altKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewNote();
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
    <main className="min-h-screen flex flex-col justify-between desk-surface-bg relative">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewNote={handleNewNote}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        activeNoteCount={notes.filter(n => !n.isArchived).length}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* DESK BOARD VIEW */}
        <DeskBoard
          notes={notes}
          onSelectNote={(note) => setActiveFocusNote(note)}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onNewNote={handleNewNote}
          onShareNote={(note) => setShareModalNote(note)}
        />

        {/* ALWAYS-ACTIVE EDGE DECK (Screen Right Edge Pill & Shingle Fan) */}
        <EdgeDeck
          notes={notes}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onNewNote={handleNewNote}
          onShareNote={(note) => setShareModalNote(note)}
        />
      </div>

      {/* FOCUS MODAL (When clicking a note on the desk board) */}
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
