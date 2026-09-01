import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PaperDeck — Tactile Edge-Docked Notes & Desk Workspace',
  description: 'Sticky notes that sleep as a thin stripe on the screen edge and fan into pastel paper tabs. Features checkbox tasks, in-place markdown, warm sepia desk view, and audio soundscapes.',
  keywords: ['notes app', 'sticky notes', 'edge notes', 'noty', 'indie hacker', 'minimalist notes', 'task checklist'],
  openGraph: {
    title: 'PaperDeck — Tactile Edge-Docked Notes & Desk Workspace',
    description: 'Sticky notes that sleep on the screen edge and fan into pastel paper tabs.',
    type: 'website',
    url: 'https://paperdeck.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="desk-surface-bg min-h-screen text-ink antialiased selection:bg-paper-lemon selection:text-ink">
        {children}
      </body>
    </html>
  );
}
