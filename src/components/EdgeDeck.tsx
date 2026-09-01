'use client';

import React, { useState, useRef } from 'react';
import { NoteItem, NOTE_COLORS } from '../types/note';
import { paperSound } from '../lib/audio';
import { NoteEditor } from './NoteEditor';
import { Plus, Pin, ChevronRight } from 'lucide-react';

interface EdgeDeckProps {
  notes: NoteItem[];
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onNewNote: () => void;
  onShareNote: (note: NoteItem) => void;
}

export const EdgeDeck: React.FC<EdgeDeckProps> = ({
  notes,
  onUpdateNote,
  onDeleteNote,
  onNewNote,
  onShareNote,
}) => {
  const [isFanned, setIsFanned] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeNotes = notes.filter(n => !n.isArchived);
  const expandedNote = activeNotes.find(n => n.id === expandedNoteId);

  const handleMouseEnterEdge = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (!isFanned) {
      setIsFanned(true);
      paperSound.playPaperFanSound();
    }
  };

  const handleMouseLeaveEdge = () => {
    // If a note is currently expanded, don't collapse on mouse leave
    if (expandedNoteId) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setIsFanned(false);
    }, 300);
  };

  const handleTabClick = (noteId: string) => {
    setExpandedNoteId(noteId);
    paperSound.playPaperFanSound();
  };

  const handleCloseExpanded = () => {
    setExpandedNoteId(null);
    paperSound.playClickSound();
  };

  return (
    <div
      onMouseEnter={handleMouseEnterEdge}
      onMouseLeave={handleMouseLeaveEdge}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center transition-all duration-300 select-none"
    >
      {/* 1. EXPANDED NOTE SHEET (Slid out level with its tab) */}
      {expandedNote && (
        <div className="mr-3 animate-fadeIn">
          <NoteEditor
            note={expandedNote}
            onUpdate={onUpdateNote}
            onDelete={(id) => {
              onDeleteNote(id);
              setExpandedNoteId(null);
            }}
            onClose={handleCloseExpanded}
            onShare={onShareNote}
          />
        </div>
      )}

      {/* 2. SHINGLED TABS FAN / REST PILL */}
      <div className="flex flex-col items-end">
        {!isFanned && !expandedNoteId ? (
          /* STATE 1: DORMANT REST PILL */
          <div
            onClick={() => setIsFanned(true)}
            className="w-3.5 py-4 rounded-l-full bg-desk-surface border-y border-l border-desk-rule shadow-md flex flex-col items-center gap-1.5 cursor-pointer hover:w-5 transition-all"
            title="Hover to fan out notes"
          >
            {activeNotes.slice(0, 6).map((note) => {
              const color = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
              return (
                <span
                  key={note.id}
                  className="w-1.5 h-3 rounded-full transition-transform hover:scale-125"
                  style={{ backgroundColor: color.dash }}
                />
              );
            })}
          </div>
        ) : (
          /* STATE 2: FANNED OUT SHINGLED TABS */
          <div className="flex flex-col items-end gap-1.5 pr-0 animate-fadeIn">
            {activeNotes.slice(0, 7).map((note, index) => {
              const color = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
              const isSelected = expandedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => handleTabClick(note.id)}
                  style={{
                    backgroundColor: color.paper,
                    color: color.ink,
                    borderColor: color.dash,
                    transitionDelay: `${index * 35}ms`,
                  }}
                  className={`relative py-3.5 px-3 rounded-l-2xl border-l-4 shadow-lg cursor-pointer transition-all duration-200 flex items-center gap-2 hover:-translate-x-2 group ${
                    isSelected ? 'translate-x-0 w-44 font-bold ring-2 ring-black/20' : 'w-36'
                  }`}
                >
                  <span className="text-xs font-mono font-bold truncate flex-1">
                    {note.title || 'Untitled note'}
                  </span>

                  {note.isPinned && (
                    <Pin className="w-3 h-3 flex-shrink-0 fill-current opacity-70" />
                  )}

                  <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}

            {/* Quick Add Tab Button */}
            <button
              type="button"
              onClick={onNewNote}
              className="w-36 py-2 px-3 rounded-l-2xl bg-desk-surface hover:bg-desk-rule/50 border-y border-l border-desk-rule text-xs font-bold text-ink-muted flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Tab</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
