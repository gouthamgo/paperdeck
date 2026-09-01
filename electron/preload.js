const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onTriggerNewNote: (callback) => ipcRenderer.on('trigger-new-note', () => callback()),
  onTriggerAllNotes: (callback) => ipcRenderer.on('trigger-all-notes', () => callback()),
  isDesktopApp: true,
});
