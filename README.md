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
index.html             # App markup and CDN library links
styles.css             # Themes, layout, and the drag-to-read overlay
app.js                 # Editor logic, file drop, export, PWA registration
manifest.webmanifest   # PWA metadata (name, icons, colors, display)
sw.js                  # Service worker — offline app shell + CDN caching
icon.svg               # Scalable app icon / favicon
icon-192.png           # Maskable icon (192×192)
icon-512.png           # Maskable icon (512×512)
```

---

## License

[MIT](LICENSE) © 2026 Ye Htut Win
