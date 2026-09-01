export type NoteColorName = 'lemon' | 'peach' | 'rose' | 'lilac' | 'sky' | 'mint' | 'sand' | 'slate';

export interface NoteColorConfig {
  name: NoteColorName;
  label: string;
  paper: string;
  dash: string;
  ink: string;
}

export const NOTE_COLORS: NoteColorConfig[] = [
  { name: 'lemon', label: 'Lemon', paper: '#FCE795', dash: '#E0AD08', ink: '#3A3008' },
  { name: 'peach', label: 'Peach', paper: '#FBCFA6', dash: '#E2762A', ink: '#422413' },
  { name: 'rose', label: 'Rose', paper: '#FAC4D1', dash: '#DC4570', ink: '#40161F' },
  { name: 'lilac', label: 'Lilac', paper: '#D9C7FA', dash: '#7C4DEE', ink: '#2A1B44' },
  { name: 'sky', label: 'Sky', paper: '#BEDDFA', dash: '#2280D6', ink: '#13293A' },
  { name: 'mint', label: 'Mint', paper: '#B4E8D0', dash: '#0E9B6E', ink: '#0F2E23' },
  { name: 'sand', label: 'Sand', paper: '#E3D3B4', dash: '#A37B3C', ink: '#372C18' },
  { name: 'slate', label: 'Slate', paper: '#CBD6E2', dash: '#4E6579', ink: '#1A242E' },
];

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  colorName: NoteColorName;
  isPinned: boolean;
  isArchived: boolean;
  tilt: number; // -4 to +4 degrees for desk view
  createdAt: string;
  updatedAt: string;
}

export type DeckViewMode = 'deck' | 'desk';

export type EdgeDeckState = 
  | { type: 'rest' }
  | { type: 'fan' }
  | { type: 'expanded'; noteId: string };
