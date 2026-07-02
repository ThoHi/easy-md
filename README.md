# EasyMD — Markdown Editor

A feature-rich Markdown editor and viewer that runs entirely in your browser. Installable as a Progressive Web App (PWA) and fully offline-capable — just open and write.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

- **Live Split-Screen Preview** — Edit Markdown on the left, see the rendered output on the right in real time.
- **Synchronized Scrolling** — Editor and preview scroll together proportionally.
- **Multiple Themes** — Aura Glass, Dracula, Nord, Medium, and Cyberpunk.
- **LaTeX Math** — Render inline and block equations using KaTeX (`$E=mc^2$`, `$$...$$`).
- **Syntax Highlighting** — Code blocks are automatically highlighted via Highlight.js.
- **Document Management** — Create, rename, and delete multiple documents. All data is auto-saved to `localStorage`.
- **View Modes** — Split view, Zen editor mode, and Reading/Preview-only mode.
- **Markdown Toolbar** — One-click buttons for bold, italic, headings, lists, tables, links, images, code, and math.
- **Drag & Drop to Read** — Drop a `.md`, `.markdown`, or `.txt` file *anywhere* on the page (drop several at once) and it opens straight into clean reading mode — no copy-paste.
- **Import** — Or use the Import dialog to browse and pick a file.
- **Export** — Download as PDF (print or canvas), standalone HTML, or raw Markdown.
- **Installable PWA** — Install to your desktop/home screen for an app-like window, and use it fully **offline** thanks to a service worker.
- **Status Bar** — Live word count, character count, and estimated reading time.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+H` | Heading |
| `Ctrl+K` | Link |

---

## Getting Started

This app is built with pure HTML, CSS, and JavaScript — no build step required.

### Option 1: Open directly

Double-click `index.html` to open it in your browser. Editing, themes, import, and export all work — but **PWA install and offline mode are disabled** over `file://` (browsers only enable service workers on `http://localhost` or HTTPS).

### Option 2: Local dev server (recommended)

**Using Node.js:**
```bash
npx serve .
```

**Using Python:**
```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## Install as an App (PWA)

EasyMD can be installed as a standalone app and used offline.

1. Serve the app over `http://localhost` (see above) or deploy it to any HTTPS static host (GitHub Pages, Netlify, Vercel, etc.).
2. Open it in a Chromium-based browser (Chrome, Edge, Brave) or another PWA-capable browser.
3. Click the **install icon** in the address bar, or the **Install App** button in the sidebar.

Once installed, it runs in its own window with a Start-menu / home-screen icon. After the first load, the service worker caches the app and its libraries, so it keeps working with no internet connection.

**Updating:** when you change the source files, bump `CACHE_VERSION` in `sw.js` (e.g. `easymd-v2`) so installed clients fetch the new version.

---

## Desktop App (Windows & macOS)

EasyMD also ships as a native desktop app via [Electron](https://www.electronjs.org/). All libraries and fonts are bundled into `vendor/`, so the desktop app runs **completely offline** with no CDN or server.

### Download

Grab a prebuilt binary from the [latest release](https://github.com/ThoHi/easy-md/releases/latest):

| Platform | Download |
|----------|----------|
| **macOS** (Intel + Apple Silicon) | [EasyMD-1.0.2-universal.dmg](https://github.com/ThoHi/easy-md/releases/download/v1.0.2/EasyMD-1.0.2-universal.dmg) |
| **macOS** (Apple Silicon only, smaller) | [EasyMD-1.0.2-arm64.dmg](https://github.com/ThoHi/easy-md/releases/download/v1.0.2/EasyMD-1.0.2-arm64.dmg) |
| **Windows** | [EasyMD-Setup-1.0.1.exe](https://github.com/ThoHi/easy-md/releases/download/v1.0.1/EasyMD-Setup-1.0.1.exe) |

On macOS, open the `.dmg` and drag **EasyMD** into your Applications folder. The Mac app is unsigned, so on first launch right-click it → **Open** (or run `xattr -cr /Applications/EasyMD.app`) to clear the Gatekeeper quarantine.

### Run in development

```bash
npm install
npm start
```

### Build the Windows installer

```bash
npm run dist
```

This produces an NSIS installer at `dist/EasyMD Setup <version>.exe` (and an unpacked build in `dist/win-unpacked/`). The installer lets you choose the install location and creates Start-menu and desktop shortcuts.

> **Note:** The build is unsigned, so Windows SmartScreen may show a "Windows protected your PC" prompt on first run — click **More info → Run anyway**. To remove this, sign the executable with a code-signing certificate.
>
> **First build on Windows:** electron-builder downloads a `winCodeSign` helper that contains macOS symlinks Windows can't extract without Developer Mode or admin rights. If the build fails on `Cannot create symbolic link`, enable **Windows Developer Mode** (Settings → Privacy & security → For developers) and rebuild.

### Build the macOS app

> macOS builds must be run on a Mac.

```bash
npm run dist:mac
```

This produces a **universal** disk image at `dist/EasyMD-<version>-universal.dmg` that runs natively on both Apple Silicon and Intel Macs (plus the app bundle at `dist/mac-universal/EasyMD.app`). Open the `.dmg` and drag **EasyMD** into your Applications folder.

To build for a single architecture instead (smaller download), pass an arch flag:

```bash
npx electron-builder --mac dmg --arm64   # Apple Silicon only
npx electron-builder --mac dmg --x64     # Intel only
```

The Mac app icon is `build/icon.icns`. If you replace `icon-512.png`, regenerate the `.icns` with macOS's `iconutil` (or `sips`) before rebuilding.

> **Note:** The build is unsigned. On first launch, macOS Gatekeeper will warn that the app is from an unidentified developer — **right-click the app → Open**, or run `xattr -cr /Applications/EasyMD.app` to clear the quarantine flag. To remove this permanently, sign and notarize the app with an Apple Developer ID certificate.

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| [Marked.js](https://marked.js.org/) | Markdown parsing |
| [KaTeX](https://katex.org/) | LaTeX math rendering |
| [Highlight.js](https://highlightjs.org/) | Syntax highlighting |
| [DOMPurify](https://github.com/cure53/DOMPurify) | XSS sanitization |
| [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) | PDF export |

---

## Project Structure

```
index.html             # App markup, references bundled local libraries
styles.css             # Themes, layout, and the drag-to-read overlay
app.js                 # Editor logic, file drop, export, PWA registration
manifest.webmanifest   # PWA metadata (name, icons, colors, display)
sw.js                  # Service worker — offline app shell caching (web)
icon.svg               # Scalable app icon / favicon
icon-192.png           # Maskable icon (192×192)
icon-512.png           # Maskable icon (512×512)
vendor/                # Bundled libraries & fonts (offline; no CDN)
electron-main.js       # Electron main process (desktop app)
package.json           # npm scripts + electron-builder config
build/icon.ico         # Windows app icon for the installer
build/icon.icns        # macOS app icon for the .dmg / .app
```

---

## License

[MIT](LICENSE) © 2026 Ye Htut Win
