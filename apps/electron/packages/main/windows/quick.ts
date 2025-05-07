import {app, BrowserWindow, ipcMain, screen} from 'electron';
import windowStateKeeper from 'electron-window-state';
import path, {dirname, join} from 'node:path';

import {fileURLToPath} from 'node:url';

// Initialize Fastify
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createQuickWindow(show = true) {
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const {width} = currentDisplay.workArea;
  const {bounds} = currentDisplay; // Use bounds of current display with cursor

  // Load the previous state with fallback to defaults
  const quickWindowState = windowStateKeeper({
    defaultWidth: 400,
    defaultHeight: 600,
  });

  const smallerWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    width: 400, // Set minimum width
    height: 600, // Set minimum height
    icon: path.join(__dirname, '/../../../buildResources/icon.png'),
    resizable: false,
    x: quickWindowState.x ?? bounds.x + width - 500,
    y: quickWindowState.y ?? 10,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    useContentSize: true,
    skipTaskbar: true,
    hasShadow: false,
    type: process.platform === 'darwin' ? 'panel' : 'toolbar',
    alwaysOnTop: true,
    center: false,
    webPreferences: {
      nodeIntegration: true,
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  smallerWindow.setAlwaysOnTop(true, 'screen-saver', 2);
  smallerWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });

  quickWindowState.manage(smallerWindow);

  if (app.dock) app.dock.show();

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
        // smallerWindow?.webContents.openDevTools();
      }
    }
  });

  /**
   * Load the main page of the main window.
   */
  smallerWindow.loadURL('http://localhost:53081/quick');

  return {window: smallerWindow, state: quickWindowState};
}

export function registerQuickStates(window: BrowserWindow) {
  // Listen for events from the renderer process
  ipcMain.on('quick-window-close', () => {
    window.hide();
  });
}
