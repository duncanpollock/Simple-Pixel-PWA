const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
  openFile: (opts) => ipcRenderer.invoke('open-file', opts),
  ready:    ()     => ipcRenderer.send('renderer-ready'),

  // Menu actions wired from main process → renderer
  onMenuAction: (callback) => {
    const events = [
      'menu-new','menu-open','menu-save',
      'menu-export-png','menu-export-sprite','menu-export-gif',
      'menu-undo','menu-redo',
    ];
    for (const ev of events) {
      ipcRenderer.on(ev, () => callback(ev));
    }
  },
});
