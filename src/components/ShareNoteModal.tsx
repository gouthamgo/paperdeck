'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NoteItem, NOTE_COLORS } from '../types/note';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';

interface ShareNoteModalProps {
  note: NoteItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareNoteModal: React.FC<ShareNoteModalProps> = ({ note, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Hooks run before the early return below so their order stays stable.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const copy = useCallback(async (text: string, mark: (v: boolean) => void) => {
    // navigator.clipboard is undefined on insecure origins and on file:// (the
    // packaged app), and writeText rejects when the document is unfocused.
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      setCopyError(false);
      mark(true);
      timersRef.current.push(setTimeout(() => mark(false), 2000));
    } catch {
      setCopyError(true);
      timersRef.current.push(setTimeout(() => setCopyError(false), 2500));
    }
  }, []);

  if (!isOpen || !note) return null;

  const color = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
  // The desktop build runs on file://, where location.origin is useless as a link.
  const isHttp = typeof window !== 'undefined' && window.location.protocol.startsWith('http');
  const shareUrl = isHttp
    ? `${window.location.origin}/#note-${note.id}`
    : `https://paperdeck.app/#note-${note.id}`;

  const handleCopyLink = () => copy(shareUrl, setCopiedLink);
  const handleCopyMarkdown = () => copy(`# ${note.title}\n\n${note.body}`, setCopiedMd);

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Share note"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-desk-surface border border-desk-rule p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        <button
          onClick={onClose}
          aria-label="Close share dialog"
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/10 text-ink-muted hover:text-ink transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle mb-1">
            Shareable Paper Link
          </div>
          <h3 className="text-xl font-display font-bold text-ink tracking-tight">
            Share &quot;{note.title}&quot;
          </h3>
        </div>

        {/* Live Note Preview Box */}
        <div
          className="p-5 rounded-2xl curled-corner shadow-md border"
          style={{ backgroundColor: color.paper, color: color.ink, borderColor: `${color.dash}44` }}
        >
          <h4 className="font-display font-bold text-base mb-1 truncate">{note.title}</h4>
          <p className="text-xs font-sans opacity-80 line-clamp-3 leading-relaxed">{note.body}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {copyError && (
            <p role="alert" className="text-[11px] font-mono text-rose-700 text-center">
              Couldn&apos;t reach the clipboard — copy the text manually.
            </p>
          )}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ink text-white font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-desk border border-desk-rule font-mono font-medium text-xs text-ink hover:bg-white transition-all cursor-pointer"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedMd ? 'Markdown Copied!' : 'Copy as Raw Markdown'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
