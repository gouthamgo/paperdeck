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

export function getStoredNotes(): NoteItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTES;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: NoteItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }
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
