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

> ⚠️ **The current build is not distributable.** `npm run dist:mac` picks up the
> `Apple Development: …` certificate from the Keychain. That certificate is only
> valid on machines provisioned to this developer account — `spctl -a -t exec`
> rejects the resulting `.app`, and anyone who downloads the DMG sees
> *"PaperDeck is damaged and can't be opened."*

To ship to customers you need two things the build does not yet have:

1. **A `Developer ID Application` certificate** (not `Apple Development`). Add it
   explicitly so the build fails loudly rather than silently signing with the
   wrong identity:
   ```json
   "mac": {
     "identity": "Developer ID Application: <Your Name> (<TEAM_ID>)"
   }
   ```
2. **Notarization**, which Apple requires for Gatekeeper to accept the app:
   ```json
   "mac": {
     "notarize": { "teamId": "<TEAM_ID>" }
   }
   ```
   with `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` in the
   environment.

Verify before uploading anywhere:
```bash
codesign -dvv --entitlements - dist/mac-arm64/PaperDeck.app
spctl -a -vvv -t exec dist/mac-arm64/PaperDeck.app   # must say "accepted"
```

Only once `spctl` reports **accepted** is `dist/PaperDeck-1.0.0-arm64.dmg` safe to
put in front of customers.

---

## 🎨 5. App Icon

The icon is generated from source rather than checked in as a binary blob only:

* `build/icon.html` — the artwork, plain HTML/CSS on the 824/1024 macOS icon grid.
* `build/render-icon.js` — renders it to `build/icon.png` via Electron.
* `build/make-icns.sh` — slices that into every required size and compiles
  `build/icon.icns` with `iconutil`.

Edit the HTML, then regenerate:

```bash
npm run icon
```

`build.mac.icon` points at `build/icon.icns`, so the next `npm run dist:mac`
picks it up automatically.

---

## 🧩 6. Known Gaps

* **`isArchived` is never set.** The field is read when filtering but nothing
  writes `true` to it — there is no archive action yet.
* **Dark mode is scaffolded but unreachable.** `tailwind.config.js` sets
  `darkMode: 'class'` and defines a full dark palette, but no `dark:` variant is
  used anywhere and nothing ever adds the `.dark` class.
