# PaperDeck ✍️

> **Tactile, edge-docked paper notes & infinite desk workspace.**  
> Inspired by physical Japanese stationery, modern Swiss craft ([styles.refero.design](https://styles.refero.design/)), and minimalist productivity.

---

## 🌟 Highlights

- **Dual Interaction Modes:**
  - **Edge Deck Mode:** Sleeps as a dormant 12px pill on the screen edge. Hovering the edge triggers a **45ms shingled cascading fan** of vertical paper tabs.
  - **Desk Board Mode:** An infinite warm sepia desk surface where notes scatter organically with physical tilt angles (`-3°` to `+3°`), push pins, and search filters.
- **8-Tone Pastel Paper Palette:** Curated pastel tones (*Lemon*, *Peach*, *Rose*, *Lilac*, *Sky*, *Mint*, *Sand*, *Slate*) with authentic paper light reflections and curled corner shadow shaders.
- **Checkbox Task Engine:** Type `⌘T` or click checkboxes (`☐` / `☑`) to complete tasks with strikethrough, dimming, and audio feedback.
- **Web Audio Soundscapes:** Native Web Audio API synthesizer for tactile paper rustles, pencil ticks, and paper tear sounds.
- **1-Click Shareable Notes:** Generate beautiful view-only web links or export raw Markdown.
- **100% Offline-First Privacy:** Stores all notes locally in IndexedDB / LocalStorage with instant auto-save.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/gouthamgo/paperdeck.git
cd paperdeck

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌥⌘N` | Create new note instantly |
| `⌘T` | Toggle checkbox task on current line |
| `⌘.` | Cycle through 8 pastel paper colors |
| `⌘P` | Pin note so it stays open |
| `Esc` | Close note and dock back to edge pill |
| `Enter` | Continue checklist automatically |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + React (TypeScript)
- **Styling:** Tailwind CSS + Custom Shaders
- **Typography:** `Bricolage Grotesque`, `Karla`, `Caveat`, `JetBrains Mono`
- **Audio:** Native Web Audio API Synthesizer
- **Icons:** Lucide React

---

## 📄 License

MIT License © 2026 PaperDeck
