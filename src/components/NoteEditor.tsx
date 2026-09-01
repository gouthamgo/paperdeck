'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NoteItem, NoteColorName, NOTE_COLORS } from '../types/note';
import { paperSound } from '../lib/audio';
import { getTaskStats, toggleTaskInBody, cycleNoteColor } from '../lib/noteStore';
import { Pin, CheckSquare, Palette, Share2, Trash2, X, Sparkles, CornerDownLeft } from 'lucide-react';

interface NoteEditorProps {
  note: NoteItem;
  onUpdate: (updated: NoteItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onShare: (note: NoteItem) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdate,
  onDelete,
  onClose,
  onShare
}) => {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentColor = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
  const { total, completed } = getTaskStats(body);

  // Sync state when note prop changes
  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
  }, [note.id]);

  // Auto-save changes debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || body !== note.body) {
        onUpdate({
          ...note,
          title,
          body,
          updatedAt: new Date().toISOString(),
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [title, body]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // ⌘T to toggle task checkbox on current line
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 't') {
      e.preventDefault();
      insertOrToggleTask();
    }

    // ⌘. to cycle note color
    if ((e.metaKey || e.ctrlKey) && e.key === '.') {
      e.preventDefault();
      const nextColor = cycleNoteColor(note.colorName);
      onUpdate({ ...note, colorName: nextColor });
      paperSound.playClickSound();
    }

    // ⌘P to toggle pin
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      onUpdate({ ...note, isPinned: !note.isPinned });
      paperSound.playClickSound();
    }

    // Enter key auto-continuation for checkboxes
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      const textBefore = body.substring(0, cursor);
      const currentLine = textBefore.split('\n').pop() || '';

      if (currentLine.startsWith('☐ ') || currentLine.startsWith('☑ ')) {
        // If line is empty task, terminate task list
        if (currentLine.trim() === '☐' || currentLine.trim() === '☑') {
          e.preventDefault();
          const startOfLine = cursor - currentLine.length;
          const newBody = body.substring(0, startOfLine) + '\n' + body.substring(cursor);
          setBody(newBody);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = startOfLine + 1;
          }, 0);
          return;
        }

        // Continue new task on next line
        e.preventDefault();
        const newBody = body.substring(0, cursor) + '\n☐ ' + body.substring(cursor);
        setBody(newBody);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursor + 3;
        }, 0);
      }
    }
  };

  const insertOrToggleTask = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const lines = body.split('\n');
    let charCount = 0;
    let targetLineIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1;
      if (charCount > cursor) {
        targetLineIdx = i;
        break;
      }
    }

    const currentLine = lines[targetLineIdx];
    if (currentLine.startsWith('☐ ')) {
      lines[targetLineIdx] = currentLine.replace(/^☐ /, '☑ ');
      paperSound.playPencilTickSound();
    } else if (currentLine.startsWith('☑ ')) {
      lines[targetLineIdx] = currentLine.replace(/^☑ /, '');
    } else {
      lines[targetLineIdx] = '☐ ' + currentLine;
      paperSound.playPencilTickSound();
    }

    setBody(lines.join('\n'));
  };

  const handleCleanBrainDump = () => {
    const lines = body.split('\n');
    const cleaned = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('☐') || trimmed.startsWith('☑')) {
        return line;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return '☐ ' + trimmed.substring(2);
      }
      return '☐ ' + trimmed;
    });

    setBody(cleaned.join('\n'));
    paperSound.playPencilTickSound();
  };

  return (
    <div
      className="relative w-full max-w-2xl rounded-2xl p-6 sm:p-8 curled-corner paper-lift-lg transition-colors flex flex-col gap-4 select-text"
      style={{
        backgroundColor: currentColor.paper,
        color: currentColor.ink,
      }}
    >
      {/* Top Header Actions */}
      <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: `${currentColor.dash}33` }}>
        {/* Task Progress Badge */}
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${currentColor.dash}25`, color: currentColor.ink }}
            >
              {completed}/{total} tasks done
            </span>
          )}
          {note.isPinned && (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold opacity-75">
              <Pin className="w-3 h-3 fill-current" />
              <span>Pinned</span>
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Insert Task Button */}
          <button
            type="button"
            onClick={insertOrToggleTask}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title="Toggle Task Checkbox (⌘T)"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {/* AI Task Clean Button */}
          <button
            type="button"
            onClick={handleCleanBrainDump}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors hidden sm:inline-flex"
            title="Convert notes to checklist"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Pin Button */}
          <button
            type="button"
            onClick={() => {
              onUpdate({ ...note, isPinned: !note.isPinned });
              paperSound.playClickSound();
            }}
            className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${
              note.isPinned ? 'bg-black/15' : ''
            }`}
            title={note.isPinned ? 'Unpin Note (⌘P)' : 'Pin Note (⌘P)'}
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Color Palette Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
              title="Change Color (⌘.)"
            >
              <Palette className="w-4 h-4" />
            </button>

            {isColorMenuOpen && (
              <div className="absolute right-0 top-8 z-50 p-2 rounded-xl bg-white shadow-xl border border-black/10 grid grid-cols-4 gap-1.5 w-36 animate-fadeIn">
                {NOTE_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => {
                      onUpdate({ ...note, colorName: col.name });
                      setIsColorMenuOpen(false);
                      paperSound.playClickSound();
                    }}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-transform hover:scale-110 ${
                      note.colorName === col.name ? 'ring-2 ring-black' : ''
                    }`}
                    style={{ backgroundColor: col.paper, borderColor: col.dash }}
                    title={col.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Share Note */}
          <button
            type="button"
            onClick={() => onShare(note)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title="Share Note ↗"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Delete / Archive */}
          <button
            type="button"
            onClick={() => {
              paperSound.playPaperTearSound();
              onDelete(note.id);
            }}
            className="p-1.5 rounded-lg hover:bg-black/10 text-rose-800 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors ml-1"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note Title Input */}
      <input
        type="text"
        placeholder="Note Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl sm:text-2xl font-display font-bold bg-transparent border-none focus:outline-none placeholder:opacity-40 tracking-tight"
        style={{ color: currentColor.ink }}
      />

      {/* Note Body Textarea */}
      <textarea
        ref={textareaRef}
        rows={12}
        placeholder="Write your note or tasks... (type ⌘T for checkbox)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none font-sans text-sm sm:text-base leading-relaxed placeholder:opacity-40"
        style={{ color: currentColor.ink }}
      />

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] font-mono opacity-60 border-t pt-2.5" style={{ borderColor: `${currentColor.dash}25` }}>
        <span>Auto-saved locally</span>
        <span>Press <kbd className="bg-black/10 border-transparent text-current">Esc</kbd> to dismiss</span>
      </div>
    </div>
  );
};
