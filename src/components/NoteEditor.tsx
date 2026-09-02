'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { NoteItem, NOTE_COLORS } from '../types/note';
import { paperSound } from '../lib/audio';
import { getTaskStats, cycleNoteColor } from '../lib/noteStore';
import { Pin, CheckSquare, Palette, Share2, Trash2, X, Sparkles } from 'lucide-react';

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
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const pendingCaretRef = useRef<number | null>(null);

  const currentColor = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
  const { total, completed } = getTaskStats(body);

  // The debounced save closes over `note`; without this ref a color/pin change
  // landing mid-debounce would be overwritten by the stale spread.
  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  // Sync state when note prop changes
  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  // Focus the body of a freshly opened note so ⌥⌘N lands you straight in typing.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  // React reassigns the controlled value on every body change, which collapses the
  // caret to the end. Restore it after the DOM write, before paint.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (pendingCaretRef.current === null || !textarea) return;
    textarea.selectionStart = textarea.selectionEnd = pendingCaretRef.current;
    pendingCaretRef.current = null;
  }, [body]);

  // Auto-save changes debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = noteRef.current;
      if (title !== current.title || body !== current.body) {
        onUpdate({
          ...current,
          title,
          body,
          updatedAt: new Date().toISOString(),
        });
      }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  // Dismiss the colour popover on an outside click or Esc.
  useEffect(() => {
    if (!isColorMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!colorMenuRef.current?.contains(e.target as Node)) setIsColorMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsColorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [isColorMenuOpen]);

  // Editor-wide shortcuts: these must work from the title field too, so they live
  // on the container rather than on the textarea.
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;

    if (e.code === 'KeyT') {
      e.preventDefault();
      insertOrToggleTask();
    } else if (e.key === '.') {
      e.preventDefault();
      onUpdate({ ...note, colorName: cycleNoteColor(note.colorName) });
      paperSound.playClickSound();
    } else if (e.code === 'KeyP') {
      e.preventDefault();
      onUpdate({ ...note, isPinned: !note.isPinned });
      paperSound.playClickSound();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter key auto-continuation for checkboxes
    if (e.key !== 'Enter' || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentLine = body.substring(0, start).split('\n').pop() || '';

    if (!currentLine.startsWith('\u2610 ') && !currentLine.startsWith('\u2611 ')) return;

    // Empty task line: terminate the list instead of extending it.
    if (currentLine.trim() === '\u2610' || currentLine.trim() === '\u2611') {
      e.preventDefault();
      const startOfLine = start - currentLine.length;
      setBody(body.substring(0, startOfLine) + '\n' + body.substring(end));
      pendingCaretRef.current = startOfLine + 1;
      return;
    }

    // Continue the checklist on the next line, replacing any selection.
    e.preventDefault();
    setBody(body.substring(0, start) + '\n\u2610 ' + body.substring(end));
    pendingCaretRef.current = start + 3;
  };

  const insertOrToggleTask = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const lines = body.split('\n');
    let charCount = 0;
    let targetLineIdx = lines.length - 1;

    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1;
      if (charCount > cursor) {
        targetLineIdx = i;
        break;
      }
    }

    const currentLine = lines[targetLineIdx];
    if (currentLine.startsWith('\u2610 ')) {
      lines[targetLineIdx] = currentLine.replace(/^\u2610 /, '\u2611 ');
      paperSound.playPencilTickSound();
    } else if (currentLine.startsWith('\u2611 ')) {
      // Same two-state cycle as the desk-board checkboxes, so the task counts agree.
      lines[targetLineIdx] = currentLine.replace(/^\u2611 /, '\u2610 ');
      paperSound.playPencilTickSound();
    } else {
      lines[targetLineIdx] = '\u2610 ' + currentLine;
      paperSound.playPencilTickSound();
    }

    pendingCaretRef.current = Math.max(0, cursor + (lines[targetLineIdx].length - currentLine.length));
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
      onKeyDown={handleEditorKeyDown}
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
            aria-label="Toggle task checkbox"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {/* AI Task Clean Button */}
          <button
            type="button"
            onClick={handleCleanBrainDump}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors hidden sm:inline-flex"
            title="Convert notes to checklist"
            aria-label="Convert notes to checklist"
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
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Color Palette Menu */}
          <div className="relative" ref={colorMenuRef}>
            <button
              type="button"
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
              title="Change Color (⌘.)"
            aria-label="Change note colour"
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
            aria-label="Share note"
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
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors ml-1"
            title="Close (Esc)"
            aria-label="Close note"
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
