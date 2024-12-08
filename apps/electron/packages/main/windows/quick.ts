import {app, BrowserWindow, ipcMain} from 'electron';
import path, {dirname, join} from 'node:path';

import {fileURLToPath} from 'node:url';

// Initialize Fastify
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createQuickWindow() {
  const smallerWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    minWidth: 700, // Set minimum width
    minHeight: 303, // Set minimum height
    icon: path.join(__dirname, '/../../../buildResources/icon.png'),
    frame: false,
    alwaysOnTop: true,
    fullscreenable: false,
    useContentSize: true,
    autoHideMenuBar: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  smallerWindow.setAlwaysOnTop(true, 'screen-saver'); // Ensure it stays on top
  smallerWindow.setSkipTaskbar(true); // Hide it from the taskbar

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  smallerWindow.on('ready-to-show', () => {
    smallerWindow.show();

    if (import.meta.env.DEV) {
      smallerWindow?.webContents.openDevTools();
    }
  });

  /**
   * Load the main page of the main window.
   */
  smallerWindow.loadURL('http://localhost:8000/search');

  return smallerWindow;
}

export function registerQuickStates(window: BrowserWindow) {
  window.on('blur', () => {
    window.hide();
  });

  // Listen for events from the renderer process
  ipcMain.on('frontend', () => {
    window.hide();
  });
}
