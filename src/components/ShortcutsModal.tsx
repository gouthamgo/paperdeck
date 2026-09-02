'use client';

import React, { useEffect } from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  // Declared before the early return so hook order stays stable.
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

  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌥⌘N', desc: 'Create new note instantly' },
    { key: '⌥⌘A', desc: 'Toggle All Notes / Desk Board' },
    { key: '⌘T', desc: 'Toggle checkbox task on current line' },
    { key: '⌘.', desc: 'Cycle through 8 pastel paper colors' },
    { key: '⌘P', desc: 'Pin note so it stays open' },
    { key: 'Esc', desc: 'Close note and dock back to edge' },
    { key: 'Enter', desc: 'Continue task checklist automatically' },
  ];

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-desk-surface border border-desk-rule p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        <button
          onClick={onClose}
          aria-label="Close shortcuts"
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/10 text-ink-muted hover:text-ink transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-desk border border-desk-rule flex items-center justify-center text-sm shadow-sm">
            ⌨️
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-ink tracking-tight">
              Keyboard Shortcuts
            </h3>
            <p className="text-xs text-ink-muted">Designed for fast, mouse-free thinking.</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-desk border border-desk-rule text-xs">
              <span className="text-ink-muted font-medium">{s.desc}</span>
              <kbd>{s.key}</kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-ink text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer mt-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
