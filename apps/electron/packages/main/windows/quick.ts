import {app, BrowserWindow, ipcMain} from 'electron';
import path, {dirname, join} from 'node:path';

import {fileURLToPath} from 'node:url';

// Initialize Fastify
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createQuickWindow(show = true) {
  const smallerWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    width: 600, // Set minimum width
    height: 400, // Set minimum height
    icon: path.join(__dirname, '/../../../buildResources/icon.png'),
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    useContentSize: true,
    skipTaskbar: true,
    hasShadow: true,
    type: process.platform === 'darwin' ? 'panel' : 'toolbar',
    alwaysOnTop: true,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  smallerWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  smallerWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  smallerWindow.on('ready-to-show', () => {
    if (show) {
      smallerWindow.show();

      if (import.meta.env.DEV) {
        smallerWindow?.webContents.openDevTools();
      }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recalculatePositionToDisplay = (position: any, from: any, to: any) => {
  const normalizedPosition = {
    x: (position.x - from.bounds.x) / from.bounds.width,
    y: (position.y - from.bounds.y) / from.bounds.height,
  };

  const newPosition = {
    x: Math.floor(to.bounds.x + normalizedPosition.x * to.bounds.width),
    y: Math.floor(to.bounds.y + normalizedPosition.y * to.bounds.height),
  };
  return newPosition;
};
