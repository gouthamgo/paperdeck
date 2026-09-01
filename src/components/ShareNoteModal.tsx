'use client';

import React, { useState } from 'react';
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

  if (!isOpen || !note) return null;

  const color = NOTE_COLORS.find(c => c.name === note.colorName) || NOTE_COLORS[0];
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#note-${note.id}` : `https://paperdeck.app/#note-${note.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const md = `# ${note.title}\n\n${note.body}`;
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-desk-surface border border-desk-rule p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        <button
          onClick={onClose}
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
