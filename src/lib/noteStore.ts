import { NoteItem, NoteColorName, NOTE_COLORS } from '../types/note';
import { paperSound } from './audio';

const STORAGE_KEY = 'paperdeck_notes_v1';

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to PaperDeck',
    body: `# Three states, one movement ✍️\n\n- Hover over the right screen edge to fan open your notes\n- Click any tab to pull it out full size\n- Hit Esc or click away to dock it back into the edge pill\n\n## Tasks you can tick off:\n☐ Try pressing ⌘T to toggle tasks\n☐ Cycle colors using the palette button\n☑ Switch between Edge Deck and Desk Board\n☐ Share a note as a public paper link`,
    colorName: 'lemon',
    isPinned: true,
    isArchived: false,
    tilt: -1.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-roadmap',
    title: 'Product Launch Checklist',
    body: `# Launch Strategy 🚀\n\n☐ Complete responsive mobile layout\n☑ Build Web Audio paper sound engine\n☑ Implement 8-tone pastel palette\n☐ Connect Stripe / Whop checkout\n☐ Post demo clip on 𝕏 / ProductHunt`,
    colorName: 'peach',
    isPinned: false,
    isArchived: false,
    tilt: 2.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-ideas',
    title: 'Feature Brain Dump',
    body: `# Micro-Utilities to Add 💡\n\n> "Good software feels like a sharp Japanese kitchen knife."\n\n- [x] Inline Markdown styling\n- [ ] Washi tape drag-and-drop\n- [ ] Encrypted export to .txt and .md\n- [ ] Quick voice note transcription`,
    colorName: 'sky',
    isPinned: false,
    isArchived: false,
    tilt: -2.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-reading',
    title: 'Reading & Quotes',
    body: `> Simplicity is about subtracting the obvious and adding the meaningful.\n— John Maeda, Laws of Simplicity\n\n**Key takeaways:**\n1. Reduce screen footprint to zero when idle\n2. Maintain physical spatial memory\n3. High-contrast typography is paramount`,
    colorName: 'mint',
    isPinned: false,
    isArchived: false,
    tilt: 1.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

function isNoteItem(value: unknown): value is NoteItem {
  const n = value as NoteItem;
  return (
    !!n &&
    typeof n === 'object' &&
    typeof n.id === 'string' &&
    typeof n.title === 'string' &&
    typeof n.body === 'string' &&
    typeof n.tilt === 'number' &&
    typeof n.isPinned === 'boolean' &&
    typeof n.isArchived === 'boolean' &&
    typeof n.createdAt === 'string' &&
    typeof n.updatedAt === 'string' &&
    NOTE_COLORS.some(c => c.name === n.colorName)
  );
}

export function getStoredNotes(): NoteItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_NOTES;
    const parsed: unknown = JSON.parse(raw);
    // Valid JSON of the wrong shape would otherwise crash every render on mount,
    // with nothing left able to rewrite the key. Drop bad entries instead.
    if (!Array.isArray(parsed)) return INITIAL_NOTES;
    const valid = parsed.filter(isNoteItem);
    return valid.length > 0 ? valid : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: NoteItem[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (err) {
    // Quota exhaustion / private-browsing storage denial must not escape into a
    // click handler and take the whole tree down.
    console.error('PaperDeck: failed to persist notes', err);
    return false;
  }
}

/** Pinned notes first, then most recently updated. */
export function sortNotes(notes: NoteItem[]): NoteItem[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function createNoteId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `note-${uuid}` : `note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getTaskStats(body: string): { total: number; completed: number } {
  const lines = body.split('\n');
  let total = 0;
  let completed = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('☐') || trimmed.startsWith('- [ ]')) {
      total++;
    } else if (trimmed.startsWith('☑') || trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]')) {
      total++;
      completed++;
    }
  }

  return { total, completed };
}

export function toggleTaskInBody(body: string, lineIdx: number): string {
  const lines = body.split('\n');
  if (lineIdx < 0 || lineIdx >= lines.length) return body;

  const line = lines[lineIdx];
  if (line.startsWith('☐')) {
    lines[lineIdx] = line.replace(/^☐/, '☑');
    paperSound.playPencilTickSound();
  } else if (line.startsWith('☑')) {
    lines[lineIdx] = line.replace(/^☑/, '☐');
    paperSound.playPencilTickSound();
  } else if (line.startsWith('- [ ]')) {
    lines[lineIdx] = line.replace(/^- \[ \]/, '- [x]');
    paperSound.playPencilTickSound();
  } else if (line.startsWith('- [x]') || line.startsWith('- [X]')) {
    lines[lineIdx] = line.replace(/^- \[[xX]\]/, '- [ ]');
    paperSound.playPencilTickSound();
  }

  return lines.join('\n');
}

export function cycleNoteColor(currentColor: NoteColorName): NoteColorName {
  const idx = NOTE_COLORS.findIndex(c => c.name === currentColor);
  const nextIdx = (idx + 1) % NOTE_COLORS.length;
  return NOTE_COLORS[nextIdx].name;
}
