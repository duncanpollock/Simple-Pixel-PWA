const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1400,
    height: 860,
    minWidth:  900,
    minHeight: 600,
    title: 'PixelCraft',
    icon: path.join(__dirname, 'build', 'icons', 'icon.png'),
    backgroundColor: '#0c0c0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });
}

/* ── Menus ────────────────────────────────────────────────────── */
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const send  = (ch) => mainWindow?.webContents.send(ch);

  const template = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about' }, { type: 'separator' },
      { role: 'services' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit' },
    ]}] : []),

    { label: 'File', submenu: [
      { label: 'New…',     accelerator: 'CmdOrCtrl+N', click: () => send('menu-new')   },
      { label: 'Open…',    accelerator: 'CmdOrCtrl+O', click: () => send('menu-open')  },
      { type: 'separator' },
      { label: 'Save…',    accelerator: 'CmdOrCtrl+S', click: () => send('menu-save')  },
      { type: 'separator' },
      { label: 'Export PNG',         accelerator: 'CmdOrCtrl+E',       click: () => send('menu-export-png')    },
      { label: 'Export Sprite Sheet',accelerator: 'CmdOrCtrl+Shift+E', click: () => send('menu-export-sprite') },
      { label: 'Export Animated GIF',                                    click: () => send('menu-export-gif')    },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ]},

    { label: 'Edit', submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z',       click: () => send('menu-undo') },
      { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', click: () => send('menu-redo') },
      { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
    ]},

    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { label: 'Developer Tools', accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I', click: () => mainWindow?.webContents.toggleDevTools() },
    ]},

    { label: 'Help', submenu: [
      { label: 'About PixelCraft', click: () => dialog.showMessageBox(mainWindow, {
        type: 'info', title: 'PixelCraft',
        message: 'PixelCraft – Pixel Art Editor',
        detail: 'A free, open-source pixel art editor built for classrooms.\n\nKeyboard shortcuts:\n  P – Pen    E – Eraser    F – Fill\n  I – Eyedropper    L – Line\n  R – Rect    O – Ellipse    M – Mirror    V – Move\n  [ / ] – brush size    + / – – zoom\n  G – toggle grid    X – swap colours\n  ← / → – previous / next frame\n  Ctrl+Z – Undo    Ctrl+Shift+Z – Redo',
        buttons: ['OK'],
      })},
    ]},
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ── IPC: save ────────────────────────────────────────────────── */
ipcMain.handle('save-file', async (_event, { defaultName, data, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'pixel-art.png',
    filters: filters || [{ name: 'PNG Image', extensions: ['png'] }],
  });
  if (result.canceled || !result.filePath) return { success: false };
  try {
    let buf;
    if (data.startsWith('data:')) {
      const base64 = data.replace(/^data:[^;]+;base64,/, '');
      buf = Buffer.from(base64, 'base64');
    } else {
      buf = Buffer.from(data, 'utf8');
    }
    fs.writeFileSync(result.filePath, buf);
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/* ── IPC: open ────────────────────────────────────────────────── */
ipcMain.handle('open-file', async (_event, { filters }) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: filters || [{ name: 'PixelCraft Project', extensions: ['pixelcraft', 'json'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return { success: false };
  try {
    const raw  = fs.readFileSync(result.filePaths[0]);
    const data = raw.toString('base64');
    return { success: true, filePath: result.filePaths[0], data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/* ── IPC: renderer ready ──────────────────────────────────────── */
ipcMain.on('renderer-ready', () => { /* reserved for future use */ });

/* ── Lifecycle ────────────────────────────────────────────────── */
app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
