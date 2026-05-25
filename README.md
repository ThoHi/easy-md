# EasyMD — Premium Markdown Editor 🚀

A high-fidelity, beautiful, and feature-rich Markdown Editor and Viewer running entirely in your browser. Designed for writing documents, taking notes, rendering LaTeX, and exporting clean PDFs or HTML files.

## 🌟 Key Features

- **Split-Screen Editor**: Edit in markdown with line numbers and preview your formatted text instantly on the right.
- **Synchronized Scrolling**: Smooth, proportional sync-scrolling between the editor and preview.
- **Beautiful Themes**: Dracula Dark, Nord Light, Cyberpunk, or Aura Glass.
- **LaTeX Math Rendering**: Formulate complex math natively using KaTeX.
- **Syntax Highlighting**: Highlight code blocks automatically using Highlight.js.
- **Document Management**: Create, rename, delete, and switch between multiple notes saved locally in your browser's `localStorage` (auto-saves as you type).
- **Import/Export Suite**:
  - **Import**: Drag and drop any `.md` or `.txt` file to edit.
  - **Export to PDF**: Generate high-quality PDFs with publication-style print layouts.
  - **Export to HTML**: Download styled, stand-alone HTML files.
  - **Export to Markdown**: Download the raw `.md` file.

---

## 🛠️ How to Run Locally

Since this app is built with pure Vanilla HTML5, CSS3, and JavaScript, it has **zero dependencies** to install. You can run it in two ways:

### Option 1: Open Directly
Double-click `index.html` inside this directory to load it directly in your web browser.

### Option 2: Run a Local Dev Server (Recommended)
Running it with a server provides the best support for loading icons, assets, and handling some file operations smoothly.

You can spin up a local server using python or Node.js.
For example, inside this folder:

**Using Node.js (npx):**
```bash
npx serve .
```

**Using Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.
