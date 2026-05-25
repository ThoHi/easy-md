# EasyMD — Markdown Editor

A feature-rich Markdown editor and viewer that runs entirely in your browser. No installs, no dependencies — just open and write.

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
- **Import** — Drag and drop any `.md` or `.txt` file directly into the editor.
- **Export** — Download as PDF (print or canvas), standalone HTML, or raw Markdown.
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

Double-click `index.html` to open it in your browser.

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

## Tech Stack

| Library | Purpose |
|---------|---------|
| [Marked.js](https://marked.js.org/) | Markdown parsing |
| [KaTeX](https://katex.org/) | LaTeX math rendering |
| [Highlight.js](https://highlightjs.org/) | Syntax highlighting |
| [DOMPurify](https://github.com/cure53/DOMPurify) | XSS sanitization |
| [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) | PDF export |

---

## License

[MIT](LICENSE) © 2026 Ye Htut Win
