const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

// Find a markdown/text file path among the process arguments (Windows passes the
// double-clicked file's path as an argument when the app is launched via "Open with").
function getFileFromArgs(argv) {
  const exts = ['.md', '.markdown', '.txt'];
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (!a || a.startsWith('--') || a === '.') continue;
    if (!exts.includes(path.extname(a).toLowerCase())) continue;
    try {
      if (fs.existsSync(a) && fs.statSync(a).isFile()) return a;
    } catch (_) { /* ignore */ }
  }
  return null;
}

// Read a file and load it into the renderer as a new document in reading mode.
function openFileInRenderer(win, filePath) {
  if (!win || !filePath) return;
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return;
  }
  const title = path.basename(filePath).replace(/\.[^/.]+$/, '');
  const js = `(() => {
    const open = () => {
      if (typeof createNewDocument === 'function') {
        createNewDocument(${JSON.stringify(title)}, ${JSON.stringify(content)});
        if (typeof setViewMode === 'function') setViewMode('preview');
        return true;
      }
      return false;
    };
    if (!open()) {
      window.addEventListener('DOMContentLoaded', open);
      setTimeout(open, 300);
    }
  })();`;
  win.webContents.executeJavaScript(js).catch(() => { /* ignore */ });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 720,
    minHeight: 500,
    backgroundColor: '#0a0b10',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile('index.html');

  // Once the page is ready, open the file the app was launched with (if any).
  let firstLoadHandled = false;
  mainWindow.webContents.on('did-finish-load', () => {
    if (firstLoadHandled) return; // don't re-open on manual reloads
    firstLoadHandled = true;
    const file = getFileFromArgs(process.argv);
    if (file) openFileInRenderer(mainWindow, file);
  });

  // Open external links (http/https) in the user's default browser, not in-app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Ensure a single instance so "Open with" reuses the running window instead of
// launching a second copy that ignores the file.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    const file = getFileFromArgs(argv);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      if (file) openFileInRenderer(mainWindow, file);
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // macOS: file opened from Finder / dock.
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    if (mainWindow) {
      openFileInRenderer(mainWindow, filePath);
    } else {
      app.whenReady().then(() => openFileInRenderer(mainWindow, filePath));
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
