/* app.js - EasyMD Application Controller */

// --- Constants & Configuration ---
const STORAGE_DOCS_KEY = 'easymd_documents';
const STORAGE_THEME_KEY = 'easymd_theme';
const STORAGE_ACTIVE_DOC_KEY = 'easymd_active_doc_id';

// Default Welcome Document Markdown
const WELCOME_MARKDOWN = `# Welcome to EasyMD! 🚀

EasyMD is a premium, high-fidelity Markdown editor and viewer designed for speed, beauty, and efficiency.

## Key Features

1. **Split-Screen Editor**: Edit in markdown with line numbers and preview your formatted text instantly on the right.
2. **Synchronized Scrolling**: Scroll the editor or the preview, and they will stay aligned.
3. **Beautiful Themes**: Choose from Dracula Dark, Nord Light, Cyberpunk, or our signature Aura Glass.
4. **LaTeX Support**: Render complex mathematical formulas natively.
5. **Syntax Highlighting**: Beautiful styling for code blocks.
6. **Export Options**: Save your work as Markdown (\`.md\`), styled HTML (\`.html\`), or high-quality PDF (\`.pdf\`).

---

## Formatting Cheatsheet

### Typography & Lists

Use standard markdown styling like **bold text**, *italics*, or ~~strikethrough~~. You can also create neat checklists:

- [x] Create a premium markdown editor
- [/] Design beautiful CSS interfaces
- [ ] Add new custom extensions

Or ordered list formatting:
1. First major milestone
2. Second major milestone

### Code Blocks with Syntax Highlighting

Here is an example of code blocks with automatic syntax highlighting:

\`\`\`javascript
// A simple function to estimate reading time
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

console.log("Welcome to EasyMD!");
\`\`\`

### Mathematical Equations (LaTeX)

Render inline math like $E = mc^2$ or block equations:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$

### Rich Data Tables

| Component | Status | Priority |
| :--- | :---: | :---: |
| Split Editor | Complete | High |
| PDF Exporter | Complete | High |
| LaTeX Parser | Complete | Medium |

---
Enjoy writing in **EasyMD**! Feel free to edit this file or click **New Document** to start fresh.
`;

// --- Application State ---
let state = {
    documents: [],
    currentDocId: null,
    theme: 'aura',
    viewMode: 'split', // 'split', 'zen', 'preview'
    isUnsaved: false
};

// --- DOM References ---
const appContainer = document.getElementById('appContainer');
const sidebar = document.getElementById('sidebar');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');
const btnNewDoc = document.getElementById('btnNewDoc');
const docList = document.getElementById('docList');
const docTitleInput = document.getElementById('docTitleInput');
const themeButtons = document.querySelectorAll('.theme-btn');
const btnViewSplit = document.getElementById('btnViewSplit');
const btnViewZen = document.getElementById('btnViewZen');
const btnViewPreview = document.getElementById('btnViewPreview');
const btnExportMenu = document.getElementById('btnExportMenu');
const exportDropdownMenu = document.getElementById('exportDropdownMenu');
const exportPrint = document.getElementById('exportPrint');
const exportPDF = document.getElementById('exportPDF');
const exportHTML = document.getElementById('exportHTML');
const exportMD = document.getElementById('exportMD');
const lineNumbers = document.getElementById('lineNumbers');
const editorTextarea = document.getElementById('editorTextarea');
const previewContainer = document.getElementById('previewContainer');
const wordCounter = document.getElementById('wordCounter');
const charCounter = document.getElementById('charCounter');
const readingTime = document.getElementById('readingTime');
const saveStatus = document.getElementById('saveStatus');
const paneEditor = document.getElementById('paneEditor');
const panePreview = document.getElementById('panePreview');

// Modals
const btnCheatsheet = document.getElementById('btnCheatsheet');
const btnImport = document.getElementById('btnImport');
const cheatsheetModal = document.getElementById('cheatsheetModal');
const importModal = document.getElementById('importModal');
const closeCheatsheetModal = document.getElementById('closeCheatsheetModal');
const closeImportModal = document.getElementById('closeImportModal');
const importArea = document.getElementById('importArea');
const fileInput = document.getElementById('fileInput');
const dropOverlay = document.getElementById('dropOverlay');

// Scroll Sync State
let isSyncingEditorScroll = false;
let isSyncingPreviewScroll = false;

// --- Initialize App ---
function init() {
    loadSettings();
    loadDocuments();
    setupEventListeners();
    renderDocList();
    loadActiveDocument();
    updateThemeUI();
    updateViewModeUI();
    updateLineNumbers();
    
    // Configure Marked.js options (marked.use() replaces deprecated marked.setOptions)
    marked.use({
        gfm: true,
        breaks: true
    });
}

// --- Load/Save State ---
function loadSettings() {
    state.theme = localStorage.getItem(STORAGE_THEME_KEY) || 'aura';
    document.body.setAttribute('data-theme', state.theme);
}

function loadDocuments() {
    const rawDocs = localStorage.getItem(STORAGE_DOCS_KEY);
    if (rawDocs) {
        try {
            state.documents = JSON.parse(rawDocs);
        } catch (e) {
            state.documents = [];
        }
    }
    
    // Create default welcome document if database is empty
    if (state.documents.length === 0) {
        const welcomeDoc = {
            id: crypto.randomUUID(),
            title: 'Welcome to EasyMD',
            content: WELCOME_MARKDOWN,
            lastModified: Date.now()
        };
        state.documents.push(welcomeDoc);
        saveDocumentsToStorage();
    }
    
    // Get active doc ID from storage, fallback to first doc
    state.currentDocId = localStorage.getItem(STORAGE_ACTIVE_DOC_KEY) || state.documents[0].id;
    
    // Validate if active doc ID exists, otherwise take first document
    if (!state.documents.find(d => d.id === state.currentDocId)) {
        state.currentDocId = state.documents[0].id;
    }
}

function saveDocumentsToStorage() {
    try {
        localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(state.documents));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            saveStatus.className = 'save-status unsaved';
            saveStatus.querySelector('i').className = 'fa-solid fa-triangle-exclamation';
            saveStatus.querySelector('span').innerText = 'Storage full — export your work!';
        }
    }
}

function saveActiveDocIdToStorage() {
    localStorage.setItem(STORAGE_ACTIVE_DOC_KEY, state.currentDocId);
}

// --- Document Operations ---
function createNewDocument(title = 'Untitled Document', content = '') {
    const newDoc = {
        id: crypto.randomUUID(),
        title: title,
        content: content,
        lastModified: Date.now()
    };
    state.documents.unshift(newDoc);
    state.currentDocId = newDoc.id;
    
    saveDocumentsToStorage();
    saveActiveDocIdToStorage();
    
    renderDocList();
    loadActiveDocument();
    
    // Focus editor
    editorTextarea.focus();
}

function deleteDocument(docId, event) {
    if (event) event.stopPropagation();
    
    if (state.documents.length <= 1) {
        alert("You must keep at least one document. Create a new one before deleting this.");
        return;
    }
    
    if (confirm("Are you sure you want to delete this document?")) {
        const index = state.documents.findIndex(d => d.id === docId);
        state.documents.splice(index, 1);
        
        // If we deleted the current active doc, redirect to the first available doc
        if (state.currentDocId === docId) {
            state.currentDocId = state.documents[0].id;
            saveActiveDocIdToStorage();
        }
        
        saveDocumentsToStorage();
        renderDocList();
        loadActiveDocument();
    }
}

function renameDocument(title) {
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (doc) {
        doc.title = title || 'Untitled';
        doc.lastModified = Date.now();
        saveDocumentsToStorage();
        renderDocList();
    }
}

function loadActiveDocument() {
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (doc) {
        docTitleInput.value = doc.title;
        editorTextarea.value = doc.content;
        updatePreview();
        updateLineNumbers();
        updateMetadata();
        setUnsavedStatus(false);
    }
}

function renderDocList() {
    docList.innerHTML = '';
    state.documents.forEach(doc => {
        const li = document.createElement('li');
        li.className = `doc-item ${doc.id === state.currentDocId ? 'active' : ''}`;
        li.setAttribute('data-id', doc.id);
        
        // Format Date
        const dateObj = new Date(doc.lastModified);
        const formattedDate = dateObj.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});

        li.innerHTML = `
            <div class="doc-item-info">
                <div class="doc-item-title">${escapeHTML(doc.title)}</div>
                <div class="doc-item-date">${formattedDate}</div>
            </div>
            <div class="doc-item-actions">
                <button class="btn-icon-sm delete-btn" title="Delete Document">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        // Load on click
        li.addEventListener('click', () => {
            if (state.currentDocId !== doc.id) {
                state.currentDocId = doc.id;
                saveActiveDocIdToStorage();
                renderDocList();
                loadActiveDocument();
            }
        });
        
        // Delete button listener
        const delBtn = li.querySelector('.delete-btn');
        delBtn.addEventListener('click', (e) => deleteDocument(doc.id, e));
        
        docList.appendChild(li);
    });
}

// --- Preview Rendering & Markdown logic ---
function updatePreview() {
    const markdown = editorTextarea.value;
    previewContainer.innerHTML = DOMPurify.sanitize(parseMarkdownWithMath(markdown), {
        ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace', 'annotation'],
        ADD_ATTR: ['xmlns', 'display', 'aria-hidden']
    });
    
    // Highlight Code blocks
    previewContainer.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

// Custom Markdown Math & LaTeX regex parser
function parseMarkdownWithMath(markdown) {
    const mathBlocks = [];
    const inlineMath = [];

    // 1. Extract block math: $$ math $$
    let text = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
        const placeholder = `<!-- BLOCK_MATH_PLACEHOLDER_${mathBlocks.length} -->`;
        mathBlocks.push(math);
        return placeholder;
    });

    // 2. Extract inline math: $ math $
    text = text.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, math) => {
        const placeholder = `<!-- INLINE_MATH_PLACEHOLDER_${inlineMath.length} -->`;
        inlineMath.push(math);
        return placeholder;
    });

    // 3. Compile markdown using marked.js
    let html = '';
    try {
        html = marked.parse(text);
    } catch (e) {
        html = `<div class="error-msg">Markdown parsing error: ${escapeHTML(e.message)}</div><pre>${escapeHTML(text)}</pre>`;
    }

    // 4. Restore block math using KaTeX
    html = html.replace(/<!-- BLOCK_MATH_PLACEHOLDER_(\d+) -->/g, (match, index) => {
        try {
            return katex.renderToString(mathBlocks[index], { displayMode: true, throwOnError: false });
        } catch (e) {
            return `<span class="math-error">${escapeHTML(mathBlocks[index])}</span>`;
        }
    });

    // 5. Restore inline math using KaTeX
    html = html.replace(/<!-- INLINE_MATH_PLACEHOLDER_(\d+) -->/g, (match, index) => {
        try {
            return katex.renderToString(inlineMath[index], { displayMode: false, throwOnError: false });
        } catch (e) {
            return `<span class="math-error">${escapeHTML(inlineMath[index])}</span>`;
        }
    });

    return html;
}

// --- UI Utilities ---
function setUnsavedStatus(unsaved) {
    state.isUnsaved = unsaved;
    if (unsaved) {
        saveStatus.className = 'save-status unsaved';
        saveStatus.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
        saveStatus.querySelector('span').innerText = 'Saving...';
    } else {
        saveStatus.className = 'save-status saved';
        saveStatus.querySelector('i').className = 'fa-solid fa-circle-check';
        saveStatus.querySelector('span').innerText = 'Saved';
    }
}

// Debounced Auto-save to localStorage
let saveTimeout;
function triggerAutoSave() {
    setUnsavedStatus(true);
    clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(() => {
        const doc = state.documents.find(d => d.id === state.currentDocId);
        if (doc) {
            doc.content = editorTextarea.value;
            doc.lastModified = Date.now();
            saveDocumentsToStorage();
            
            // Re-render date / title changes in sidebar without visual jitter
            const activeItem = docList.querySelector(`[data-id="${doc.id}"]`);
            if (activeItem) {
                const titleDiv = activeItem.querySelector('.doc-item-title');
                if (titleDiv) titleDiv.innerText = doc.title;
            }
            
            setUnsavedStatus(false);
        }
    }, 800); // 800ms debounce
}

// Update line numbers count
function updateLineNumbers() {
    const lines = editorTextarea.value.split('\n');
    const lineCount = lines.length;
    let numbersHTML = '';
    for (let i = 1; i <= lineCount; i++) {
        numbersHTML += `<span>${i}</span>`;
    }
    lineNumbers.innerHTML = numbersHTML;
}

// Update word, character, and reading time values
function updateMetadata() {
    const text = editorTextarea.value.trim();
    if (text === '') {
        wordCounter.innerText = '0 words';
        charCounter.innerText = '0 characters';
        readingTime.innerText = '0 min read';
        return;
    }
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    const minutes = Math.max(1, Math.ceil(words / 200)); // ~200 WPM
    
    wordCounter.innerText = `${words} word${words === 1 ? '' : 's'}`;
    charCounter.innerText = `${chars} character${chars === 1 ? '' : 's'}`;
    readingTime.innerText = `${minutes} min read`;
}

// --- Sync Scrolling ---
function handleEditorScroll() {
    if (isSyncingPreviewScroll) {
        isSyncingPreviewScroll = false;
        return;
    }
    isSyncingEditorScroll = true;
    
    // Sync line numbers scrolling
    lineNumbers.scrollTop = editorTextarea.scrollTop;
    
    // Calculate ratio
    const editorScrollable = editorTextarea.scrollHeight - editorTextarea.clientHeight;
    if (editorScrollable <= 0) return;
    const ratio = editorTextarea.scrollTop / editorScrollable;
    
    // Apply ratio to preview
    const previewScrollable = previewContainer.scrollHeight - previewContainer.clientHeight;
    previewContainer.scrollTop = ratio * previewScrollable;
}

function handlePreviewScroll() {
    if (isSyncingEditorScroll) {
        isSyncingEditorScroll = false;
        return;
    }
    isSyncingPreviewScroll = true;
    
    // Calculate ratio
    const previewScrollable = previewContainer.scrollHeight - previewContainer.clientHeight;
    if (previewScrollable <= 0) return;
    const ratio = previewContainer.scrollTop / previewScrollable;
    
    // Apply ratio to editor
    const editorScrollable = editorTextarea.scrollHeight - editorTextarea.clientHeight;
    editorTextarea.scrollTop = ratio * editorScrollable;
    lineNumbers.scrollTop = editorTextarea.scrollTop;
}

// --- Theme Management ---
function switchTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem(STORAGE_THEME_KEY, themeName);
    document.body.setAttribute('data-theme', themeName);
    updateThemeUI();
}

function updateThemeUI() {
    themeButtons.forEach(btn => {
        if (btn.getAttribute('data-theme-val') === state.theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// --- View Modes Layout ---
function setViewMode(mode) {
    state.viewMode = mode;
    updateViewModeUI();
}

function updateViewModeUI() {
    // Reset classes
    appContainer.classList.remove('zen-mode', 'preview-mode');
    btnViewSplit.classList.remove('active');
    btnViewZen.classList.remove('active');
    btnViewPreview.classList.remove('active');
    
    if (state.viewMode === 'zen') {
        appContainer.classList.add('zen-mode');
        btnViewZen.classList.add('active');
    } else if (state.viewMode === 'preview') {
        appContainer.classList.add('preview-mode');
        btnViewPreview.classList.add('active');
    } else {
        btnViewSplit.classList.add('active');
    }
}

// --- Toolbar insertion helper functions ---
function insertFormatting(type) {
    const textarea = editorTextarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    let replacement = '';
    let selectionOffset = 0;
    
    switch (type) {
        case 'bold':
            replacement = `**${selection || 'bold text'}**`;
            selectionOffset = selection ? 0 : 2;
            break;
        case 'italic':
            replacement = `*${selection || 'italic text'}*`;
            selectionOffset = selection ? 0 : 1;
            break;
        case 'heading':
            replacement = `\n## ${selection || 'Heading'}\n`;
            selectionOffset = selection ? 0 : 3;
            break;
        case 'list-ul':
            replacement = `\n- ${selection || 'Item'}`;
            break;
        case 'list-ol':
            replacement = `\n1. ${selection || 'Item'}`;
            break;
        case 'checklist':
            replacement = `\n- [ ] ${selection || 'Task'}`;
            break;
        case 'code':
            replacement = `\`${selection || 'code'}\``;
            selectionOffset = selection ? 0 : 1;
            break;
        case 'code-block':
            replacement = `\n\`\`\`javascript\n${selection || '// code block here'}\n\`\`\`\n`;
            selectionOffset = selection ? 0 : 15;
            break;
        case 'quote':
            replacement = `\n> ${selection || 'Quote'}\n`;
            break;
        case 'link':
            replacement = `[${selection || 'link text'}](https://example.com)`;
            selectionOffset = selection ? 0 : 1;
            break;
        case 'image':
            replacement = `![${selection || 'Alt text'}](https://via.placeholder.com/600x400)`;
            selectionOffset = selection ? 0 : 2;
            break;
        case 'table':
            replacement = `\n| Header | Title |\n|--------|-------|\n| Cell 1 | Cell 2 |\n`;
            break;
        case 'math':
            replacement = `$$${selection || 'E = mc^2'}$$`;
            selectionOffset = selection ? 0 : 2;
            break;
    }
    
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    // Set selection focus back to editor
    textarea.focus();
    if (selectionOffset > 0) {
        textarea.setSelectionRange(start + selectionOffset, start + replacement.length - selectionOffset);
    } else {
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }
    
    updatePreview();
    updateLineNumbers();
    updateMetadata();
    triggerAutoSave();
}

// --- Import / Export Logic ---
function exportAsMarkdown() {
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (!doc) return;
    
    const blob = new Blob([editorTextarea.value], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${slugify(doc.title)}.md`);
}

function exportAsHTML() {
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (!doc) return;
    
    // Re-render from source (not live DOM) to avoid exporting any injected content
    const safeBodyHTML = DOMPurify.sanitize(parseMarkdownWithMath(doc.content), {
        ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace', 'annotation'],
        ADD_ATTR: ['xmlns', 'display', 'aria-hidden']
    });

    // Build self-contained HTML page with proper styles and math libraries loaded
    const compiledHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'none'">
    <title>${escapeHTML(doc.title)}</title>
    <!-- Outfit Font & KaTeX CSS -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather&family=Outfit:wght@400;700&display=swap">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVdqiG7Kjzs95dyRL4yR3OBgDR35nm4dFnh1gJDYWvSgUM5fF721AlaYcRe0UN" crossorigin="anonymous">
    <style>
        body {
            font-family: 'Merriweather', serif;
            line-height: 1.65;
            color: #1f2937;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
        }
        h1, h2, h3, h4 {
            font-family: 'Outfit', sans-serif;
            color: #111827;
            margin-top: 1.5em;
        }
        pre {
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid #e5e7eb;
        }
        code {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 2px 4px;
            border-radius: 4px;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #7c3aed;
            padding-left: 20px;
            color: #6b7280;
            margin: 1.5em 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1.5em;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
        }
        th {
            background-color: #f9fafb;
        }
    </style>
</head>
<body>
    <h1>${escapeHTML(doc.title)}</h1>
    <hr>
    <div class="markdown-body">
        ${safeBodyHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([compiledHTML], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, `${slugify(doc.title)}.html`);
}

function exportAsPDF() {
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (!doc) return;
    
    // Configure html2pdf.js
    const element = previewContainer;
    
    // We clone the elements or configure html2pdf.js options to render properly
    const opt = {
        margin:       [15, 15, 15, 15],
        filename:     `${slugify(doc.title)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Show spinner in export button or change status
    const origHTML = btnExportMenu.innerHTML;
    btnExportMenu.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Exporting...`;
    btnExportMenu.disabled = true;

    // Use html2pdf.js library to convert html to PDF
    html2pdf().set(opt).from(element).save().then(() => {
        btnExportMenu.innerHTML = origHTML;
        btnExportMenu.disabled = false;
    }).catch(err => {
        alert("Failed to export PDF: " + err.message);
        btnExportMenu.innerHTML = origHTML;
        btnExportMenu.disabled = false;
    });
}

function handleFileUpload(file, readMode = false) {
    if (!file) return;

    // Validate file type — enforce .md, .txt, .markdown regardless of how the file was provided
    const allowedExtensions = /\.(md|txt|markdown)$/i;
    const allowedMimeTypes = ['text/plain', 'text/markdown', 'text/x-markdown', ''];
    if (!allowedExtensions.test(file.name) && !allowedMimeTypes.includes(file.type)) {
        alert('Only .md, .txt, and .markdown files are supported.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        createNewDocument(nameWithoutExt, content);
        closeModal(importModal);
        // When a file is dropped onto the window, jump straight into clean reading mode
        if (readMode) setViewMode('preview');
    };
    reader.readAsText(file);
}

// Load one or more dropped files. The last valid file is opened in reading mode.
function handleDroppedFiles(fileList, readMode = false) {
    const files = Array.from(fileList).filter(f => /\.(md|txt|markdown)$/i.test(f.name));
    if (files.length === 0) {
        alert('Only .md, .txt, and .markdown files are supported.');
        return;
    }
    // Load earlier files quietly, then open the last one in reading mode
    files.forEach((file, index) => {
        handleFileUpload(file, readMode && index === files.length - 1);
    });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Document Edit event
    editorTextarea.addEventListener('input', () => {
        updatePreview();
        updateLineNumbers();
        updateMetadata();
        triggerAutoSave();
    });

    // Handle Tab key in Textarea (insert 4 spaces; press Escape first to re-enable normal Tab navigation)
    let tabTrapped = true;
    editorTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            tabTrapped = false; // allow next Tab to navigate away
            return;
        }
        if (e.key === 'Tab' && tabTrapped) {
            e.preventDefault();
            const textarea = editorTextarea;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            updatePreview();
            updateLineNumbers();
            triggerAutoSave();
        } else if (e.key === 'Tab' && !tabTrapped) {
            tabTrapped = true; // re-enable trapping after the user navigates back in
        }
        
        // Keyboard Shortcuts
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    insertFormatting('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    insertFormatting('italic');
                    break;
                case 'h':
                    e.preventDefault();
                    insertFormatting('heading');
                    break;
                case 'k':
                    e.preventDefault();
                    insertFormatting('link');
                    break;
            }
        }
    });

    // Rename Document
    docTitleInput.addEventListener('input', () => {
        const title = docTitleInput.value.trim();
        renameDocument(title);
    });

    // Sync Scrolling
    editorTextarea.addEventListener('scroll', handleEditorScroll);
    previewContainer.addEventListener('scroll', handlePreviewScroll);

    // Sidebar toggles
    sidebarCollapseBtn.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
        sidebarExpandBtn.style.display = 'block';
    });
    
    sidebarExpandBtn.addEventListener('click', () => {
        sidebar.classList.remove('collapsed');
        sidebarExpandBtn.style.display = 'none';
    });

    // Create New Doc
    btnNewDoc.addEventListener('click', () => {
        createNewDocument('New Note', '# New Note\nStart writing here...');
    });

    // Theme Picker
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTheme(btn.getAttribute('data-theme-val'));
        });
    });

    // View Picker
    btnViewSplit.addEventListener('click', () => setViewMode('split'));
    btnViewZen.addEventListener('click', () => setViewMode('zen'));
    btnViewPreview.addEventListener('click', () => setViewMode('preview'));

    // Export Dropdown Trigger
    btnExportMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        exportDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        exportDropdownMenu.classList.remove('show');
    });

    exportPrint.addEventListener('click', () => {
        window.print();
    });
    exportPDF.addEventListener('click', exportAsPDF);
    exportHTML.addEventListener('click', exportAsHTML);
    exportMD.addEventListener('click', exportAsMarkdown);

    // Modal Events
    btnCheatsheet.addEventListener('click', () => openModal(cheatsheetModal));
    btnImport.addEventListener('click', () => openModal(importModal));
    
    closeCheatsheetModal.addEventListener('click', () => closeModal(cheatsheetModal));
    closeImportModal.addEventListener('click', () => closeModal(importModal));
    
    // Close modal on clicking overlay
    window.addEventListener('click', (e) => {
        if (e.target === cheatsheetModal) closeModal(cheatsheetModal);
        if (e.target === importModal) closeModal(importModal);
    });

    // File Drag & Drop
    importArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0]);
        }
    });

    importArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        importArea.classList.add('dragover');
    });

    importArea.addEventListener('dragleave', () => {
        importArea.classList.remove('dragover');
    });

    importArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation(); // let the modal handle its own drop; don't double-load via window
        importArea.classList.remove('dragover');
        dropOverlay.classList.remove('show');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // Full-window Drag & Drop — drop a .md file anywhere on the page to read it.
    // Use a counter so the overlay doesn't flicker when dragging over child elements.
    let dragDepth = 0;
    const isFileDrag = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');

    window.addEventListener('dragenter', (e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        dragDepth++;
        dropOverlay.classList.add('show');
    });

    window.addEventListener('dragover', (e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    window.addEventListener('dragleave', (e) => {
        if (!isFileDrag(e)) return;
        dragDepth--;
        if (dragDepth <= 0) {
            dragDepth = 0;
            dropOverlay.classList.remove('show');
        }
    });

    window.addEventListener('drop', (e) => {
        dragDepth = 0;
        dropOverlay.classList.remove('show');
        if (!e.dataTransfer || e.dataTransfer.files.length === 0) return;
        e.preventDefault();
        handleDroppedFiles(e.dataTransfer.files, true);
    });
}

// --- Modals ---
function openModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}

// --- Helper Functions ---
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Setup elements for formatting button clicks
const toolbarBindings = {
    'tbBold': 'bold',
    'tbItalic': 'italic',
    'tbHeading': 'heading',
    'tbListUl': 'list-ul',
    'tbListOl': 'list-ol',
    'tbChecklist': 'checklist',
    'tbCode': 'code',
    'tbCodeBlock': 'code-block',
    'tbQuote': 'quote',
    'tbLink': 'link',
    'tbImage': 'image',
    'tbTable': 'table',
    'tbMath': 'math'
};

Object.entries(toolbarBindings).forEach(([btnId, formatType]) => {
    const btnElement = document.getElementById(btnId);
    if (btnElement) {
        btnElement.addEventListener('click', () => insertFormatting(formatType));
    }
});

// --- PWA: Service Worker registration & install prompt ---
function setupPWA() {
    // Register the service worker for offline support (web only — skip on file://,
    // e.g. inside the packaged Electron app, where assets are already local).
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch((err) => {
                console.warn('Service worker registration failed:', err);
            });
        });
    }

    // Custom install button (shown only when the browser offers installation)
    const btnInstall = document.getElementById('btnInstall');
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (btnInstall) btnInstall.style.display = 'flex';
    });

    if (btnInstall) {
        btnInstall.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            btnInstall.style.display = 'none';
        });
    }

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        if (btnInstall) btnInstall.style.display = 'none';
    });
}

// Run Init
window.addEventListener('DOMContentLoaded', init);
setupPWA();
