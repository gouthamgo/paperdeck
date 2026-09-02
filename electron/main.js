const { app, BrowserWindow, globalShortcut, Menu, shell, screen } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1280, width),
    height: Math.min(860, height),
    minWidth: 800,
    minHeight: 600,
    title: 'PaperDeck',
    titleBarStyle: 'hiddenInset', // Native macOS traffic lights inset
    trafficLightPosition: { x: 16, y: 18 },
    // An opaque backgroundColor paints over vibrancy, so the two can't coexist.
    // The paper desk surface is opaque by design — keep the solid colour.
    backgroundColor: '#EFEBE3',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // loadFile handles asar paths and URL-escaping; a hand-built file:// URL
    // breaks as soon as the install path contains a space or '#'.
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Without this a failed load is completely silent — just an empty window.
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`PaperDeck: load failed (${errorCode} ${errorDescription}) for ${validatedURL}`);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Global Carbon-Style Hotkeys for macOS
function sendToWindow(channel) {
  // On macOS the app stays alive with no windows (⌘W), so recreate one rather
  // than letting the hotkey become permanently inert.
  if (!mainWindow) {
    createWindow();
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send(channel);
    });
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
  mainWindow.webContents.send(channel);
}

function registerShortcuts() {
  const shortcuts = [
    ['Alt+Command+N', 'trigger-new-note'],
    ['Alt+Command+A', 'trigger-all-notes'],
  ];

  for (const [accelerator, channel] of shortcuts) {
    // register() returns false when the OS or another app already owns the chord,
    // or when Accessibility permission was denied.
    const registered = globalShortcut.register(accelerator, () => sendToWindow(channel));
    if (!registered) {
      console.warn(`PaperDeck: could not register ${accelerator} — another app may own it.`);
    }
  }
}

// Native macOS Menu Bar
function createMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Note',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'Alt+Cmd+N',
          registerAccelerator: false,
          click: () => sendToWindow('trigger-new-note'),
        },
        {
          label: 'All Notes / Desk Board',
          accelerator: 'Alt+Cmd+A',
          registerAccelerator: false,
          click: () => sendToWindow('trigger-all-notes'),
        },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
