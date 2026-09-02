export interface ElectronAPI {
  /** Subscribe to the ⌥⌘N global shortcut / menu item. Returns an unsubscribe fn. */
  onTriggerNewNote: (callback: () => void) => () => void;
  /** Subscribe to the ⌥⌘A global shortcut / menu item. Returns an unsubscribe fn. */
  onTriggerAllNotes: (callback: () => void) => () => void;
  isDesktopApp: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
