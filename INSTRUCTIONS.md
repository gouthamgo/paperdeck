# PaperDeck — Quick Start & Build Instructions ✍️

**GitHub Repository:** [https://github.com/gouthamgo/paperdeck](https://github.com/gouthamgo/paperdeck)  
**Local Project Path:** `/Users/ganguly/Documents/CC/paperdeck`

---

## 🚀 1. How to Run Locally

### A. Run as Web App (Browser)
```bash
cd /Users/ganguly/Documents/CC/paperdeck
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### B. Run as Native macOS Desktop App (Live Dev Mode)
```bash
cd /Users/ganguly/Documents/CC/paperdeck
npm run electron:dev
```
Launches the native macOS window with traffic lights, vibrancy, and global shortcuts.

---

## 📦 2. How to Build the macOS `.dmg` Installer Package

To compile, code-sign with your Apple Developer account, and package a release `.dmg`:

```bash
cd /Users/ganguly/Documents/CC/paperdeck
npm run dist:mac
```

### Build Outputs Generated:
* **Installer Disk Image (`.dmg`):** `dist/PaperDeck-1.0.0-arm64.dmg`
* **Direct Zip Package (`.zip`):** `dist/PaperDeck-1.0.0-arm64-mac.zip`
* **Standalone Mac App (`.app`):** `dist/mac-arm64/PaperDeck.app`

---

## ⌨️ 3. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌥⌘N` | Create new note instantly |
| `⌥⌘A` | Toggle All Notes / Desk Board view |
| `⌘T` | Toggle checkbox task on current line (`☐` / `☑`) |
| `⌘.` | Cycle through 8 pastel paper colors |
| `⌘P` | Pin note so it stays open |
| `Esc` | Close note and dock back to edge pill |
| `Enter` | Continue checklist automatically |

---

## 🔐 4. Apple Developer Signing & Distribution

* **Automatic Signing:** Electron Builder automatically detects your Apple Developer Certificate in macOS Keychain (`Apple Development: gouthamm08@icloud.com`) and signs all binaries during `npm run dist:mac`.
* **Distribution:** Upload `dist/PaperDeck-1.0.0-arm64.dmg` to Whop, Stripe, or your website for customers to download and drag into `/Applications`.
