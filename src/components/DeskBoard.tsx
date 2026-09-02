'use client';

import React, { useState } from 'react';
import { NoteItem, NOTE_COLORS, NoteColorName } from '../types/note';
import { paperSound } from '../lib/audio';
import { getTaskStats, toggleTaskInBody, sortNotes } from '../lib/noteStore';
import { Search, Pin, Plus, Share2, Trash2 } from 'lucide-react';

interface DeskBoardProps {
  notes: NoteItem[];
  onSelectNote: (note: NoteItem) => void;
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onNewNote: () => void;
  onShareNote: (note: NoteItem) => void;
}

export const DeskBoard: React.FC<DeskBoardProps> = ({
  notes,
  onSelectNote,
  onUpdateNote,
  onDeleteNote,
  onNewNote,
  onShareNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  const openNote = (note: NoteItem) => {
    onSelectNote(note);
    paperSound.playPaperFanSound();
  };

  const activeNotes = notes.filter(n => !n.isArchived);

  const filteredNotes = sortNotes(notes.filter(n => {
    if (n.isArchived) return false;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedColor === 'all' || n.colorName === selectedColor;
    return matchesSearch && matchesColor;
  }));

  const handleTaskCheckboxClick = (e: React.SyntheticEvent, note: NoteItem, lineIdx: number) => {
    e.stopPropagation();
    const updatedBody = toggleTaskInBody(note.body, lineIdx);
    onUpdateNote({
      ...note,
      body: updatedBody,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 select-none">
      {/* Desk Board Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-ink-subtle mb-1">
            Physical Desk View
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-ink tracking-tight">
            Your Paper Desk
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Click any note to pull it open into focus.
          </p>
        </div>

        {/* Search & Palette Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-desk-surface border border-desk-rule text-ink text-xs font-sans placeholder:text-ink-subtle focus:outline-none focus:border-ink/40 transition-colors"
            />
          </div>

          {/* New Note CTA */}
          <button
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink text-desk text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Color Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setSelectedColor('all')}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
            selectedColor === 'all'
              ? 'bg-ink text-white shadow-sm'
              : 'bg-desk-surface text-ink-muted hover:text-ink border border-desk-rule'
          }`}
        >
          All Notes ({activeNotes.length})
        </button>

        {NOTE_COLORS.map((col) => (
          <button
            key={col.name}
            onClick={() => setSelectedColor(col.name)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-transform cursor-pointer ${
              selectedColor === col.name ? 'ring-2 ring-ink scale-105 shadow-sm' : 'border'
            }`}
            style={{ backgroundColor: col.paper, color: col.ink, borderColor: col.dash }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dash }} />
            <span>{col.label}</span>
          </button>
        ))}
      </div>

      {/* Scattered Post-It Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-desk-rule p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="text-3xl">📄</span>
          <h3 className="text-base font-bold text-ink">No notes found</h3>
          <p className="text-xs text-ink-muted max-w-sm">
            Create your first paper note to scatter it on the desk.
          </p>
          <button
            onClick={onNewNote}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredNotes.map((note) => {
            const color = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
            const { total, completed } = getTaskStats(note.body);
            const lines = note.body.split('\n').slice(0, 6);

            return (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                aria-label={`Open note ${note.title || 'Untitled Note'}`}
                onClick={() => openNote(note)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openNote(note);
                  }
                }}
                onMouseEnter={() => setHoveredNoteId(note.id)}
                onMouseLeave={() => setHoveredNoteId(prev => (prev === note.id ? null : prev))}
                onFocus={() => setHoveredNoteId(note.id)}
                onBlur={() => setHoveredNoteId(prev => (prev === note.id ? null : prev))}
                className="relative rounded-2xl p-6 curled-corner paper-lift hover:paper-lift-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[260px] group"
                style={{
                  backgroundColor: color.paper,
                  color: color.ink,
                  // An inline transform beats Tailwind's hover:scale utility, so the
                  // lift has to be composed here alongside the tilt.
                  transform: `rotate(${note.tilt}deg) scale(${hoveredNoteId === note.id ? 1.02 : 1})`,
                }}
              >
                <div>
                  {/* Top Bar on Note */}
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5 mb-3" style={{ borderColor: `${color.dash}33` }}>
                    <div className="flex items-center gap-2">
                      {total > 0 && (
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${color.dash}25`, color: color.ink }}
                        >
                          {completed}/{total} tasks
                        </span>
                      )}
                      {note.isPinned && (
                        <Pin className="w-3.5 h-3.5 fill-current opacity-70" />
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareNote(note);
                        }}
                        className="p-1 rounded hover:bg-black/10 transition-colors"
                        title="Share Note"
                        aria-label="Share note"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          paperSound.playPaperTearSound();
                          onDeleteNote(note.id);
                        }}
                        className="p-1 rounded hover:bg-black/10 text-rose-900 transition-colors"
                        title="Delete Note"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-display font-bold tracking-tight mb-2 truncate">
                    {note.title || 'Untitled Note'}
                  </h3>

                  {/* Body Preview with Interactive Task Checkboxes */}
                  <div className="space-y-1 text-xs leading-relaxed opacity-85">
                    {lines.map((line, idx) => {
                      const isTask = line.startsWith('☐ ') || line.startsWith('☑ ') || line.startsWith('- [ ]') || line.startsWith('- [x]');
                      const isDone = line.startsWith('☑ ') || line.startsWith('- [x]');

                      if (isTask) {
                        const taskText = line.replace(/^(☐ |☑ |- \[ \] |- \[x\] )/, '');
                        return (
                          <div
                            key={idx}
                            role="checkbox"
                            aria-checked={isDone}
                            tabIndex={0}
                            onClick={(e) => handleTaskCheckboxClick(e, note, idx)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTaskCheckboxClick(e, note, idx);
                              }
                            }}
                            className="flex items-start gap-1.5 hover:opacity-100 cursor-pointer"
                          >
                            <span className="font-mono text-sm leading-none mt-0.5">
                              {isDone ? '☑' : '☐'}
                            </span>
                            <span className={`truncate ${isDone ? 'line-through opacity-50' : ''}`}>
                              {taskText}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <p key={idx} className="truncate">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t flex items-center justify-between text-[10px] font-mono opacity-50 mt-4" style={{ borderColor: `${color.dash}25` }}>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <span>Click to edit</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
