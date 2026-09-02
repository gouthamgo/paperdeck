const { contextBridge, ipcRenderer } = require('electron');

// Each subscribe returns an unsubscribe function so the renderer can clean up
// its listeners (React effects re-run on every mount in StrictMode/dev).
function subscribe(channel, callback) {
  const listener = () => callback();
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  onTriggerNewNote: (callback) => subscribe('trigger-new-note', callback),
  onTriggerAllNotes: (callback) => subscribe('trigger-all-notes', callback),
  isDesktopApp: true,
});
