'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NoteItem, NOTE_COLORS } from '../types/note';
import { sortNotes } from '../lib/noteStore';
import { paperSound } from '../lib/audio';
import { NoteEditor } from './NoteEditor';
import { Plus, Pin, ChevronRight, LayoutGrid } from 'lucide-react';

interface EdgeDeckProps {
  notes: NoteItem[];
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onNewNote: () => void;
  onShareNote: (note: NoteItem) => void;
  onOpenAllNotes: () => void;
  /** False while a modal is stacked above the deck, so Esc dismisses that instead. */
  escapeEnabled?: boolean;
}

export const EdgeDeck: React.FC<EdgeDeckProps> = ({
  notes,
  onUpdateNote,
  onDeleteNote,
  onNewNote,
  onShareNote,
  onOpenAllNotes,
  escapeEnabled = true,
}) => {
  const [isFanned, setIsFanned] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeNotes = sortNotes(notes.filter(n => !n.isArchived));
  const expandedNote = activeNotes.find(n => n.id === expandedNoteId);

  const handleMouseEnterEdge = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (!isFanned) {
      setIsFanned(true);
      paperSound.playPaperFanSound();
    }
  };

  const handleMouseLeaveEdge = () => {
    if (expandedNoteId) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setIsFanned(false);
    }, 350);
  };

  const handleTabClick = (noteId: string) => {
    setExpandedNoteId(noteId);
    paperSound.playPaperFanSound();
  };

  const handleCloseExpanded = () => {
    setExpandedNoteId(null);
    // Leaving the deck fanned would strand it over the desk: the pointer is
    // already outside the container, so no further mouseleave will fire.
    setIsFanned(false);
    paperSound.playClickSound();
  };

  // The pending un-fan timer must not outlive the component.
  useEffect(() => () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  // Esc docks an edge-expanded note, matching what the editor footer promises.
  useEffect(() => {
    if (!expandedNoteId || !escapeEnabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleCloseExpanded();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedNoteId, escapeEnabled]);

  return (
    <div
      onMouseEnter={handleMouseEnterEdge}
      onMouseLeave={handleMouseLeaveEdge}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center transition-all duration-300 select-none"
    >
      {/* 1. EXPANDED NOTE SHEET (Pulls out level with its tab) */}
      {expandedNote && (
        <div className="mr-4 animate-fadeIn">
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

      {/* 2. SHINGLED TABS FAN / DORMANT EDGE PILL */}
      <div className="flex flex-col items-end">
        {!isFanned && !expandedNoteId ? (
          /* STATE 1: DORMANT REST PILL */
          <div
            role="button"
            tabIndex={0}
            aria-label="Open note deck"
            onClick={() => {
              setIsFanned(true);
              paperSound.playPaperFanSound();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsFanned(true);
                paperSound.playPaperFanSound();
              }
            }}
            className="group py-6 px-1.5 rounded-l-2xl bg-desk-surface hover:bg-white border-y border-l border-desk-rule shadow-xl flex flex-col items-center gap-2 cursor-pointer transition-all hover:pr-3"
            title="Slide pointer to right edge to fan notes"
          >
            {activeNotes.slice(0, 7).map((note) => {
              const color = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
              return (
                <span
                  key={note.id}
                  className="w-1.5 h-3.5 rounded-full transition-transform group-hover:scale-125 shadow-sm"
                  style={{ backgroundColor: color.dash }}
                />
              );
            })}
            <span className="text-[9px] font-mono text-ink-subtle vertical-tab-title opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              DECK
            </span>
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Open note ${note.title || 'Untitled note'}`}
                  onClick={() => handleTabClick(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTabClick(note.id);
                    }
                  }}
                  style={{
                    backgroundColor: color.paper,
                    color: color.ink,
                    borderColor: color.dash,
                    transitionDelay: `${index * 35}ms`,
                  }}
                  className={`relative py-3.5 px-3.5 rounded-l-2xl border-l-4 shadow-xl cursor-pointer transition-all duration-200 flex items-center gap-2 hover:-translate-x-2 group ${
                    isSelected ? 'translate-x-0 w-48 font-bold ring-2 ring-black/25' : 'w-40'
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

            {/* All Notes Button (Opens full desk) */}
            <button
              type="button"
              onClick={() => {
                onOpenAllNotes();
                setIsFanned(false);
                paperSound.playPaperFanSound();
              }}
              className="w-40 py-2 px-3 rounded-l-2xl bg-desk-surface hover:bg-white border-y border-l border-desk-rule text-[11px] font-bold text-ink-muted flex items-center justify-between shadow-sm transition-all cursor-pointer"
              title="Open full desk (⌥⌘A)"
            >
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3 h-3" />
                <span>All Notes</span>
              </div>
              <kbd className="text-[9px] py-0 px-1">⌥⌘A</kbd>
            </button>

            {/* Quick Add Tab */}
            <button
              type="button"
              onClick={onNewNote}
              className="w-40 py-2 px-3 rounded-l-2xl bg-ink text-desk hover:opacity-90 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Note (⌥⌘N)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
