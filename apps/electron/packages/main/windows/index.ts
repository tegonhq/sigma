import {globalShortcut, Menu, nativeImage, Tray, type BrowserWindow, screen} from 'electron';
import {createMainWindow} from './main';
import {createQuickWindow, registerQuickStates} from './quick';

import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {registerDeepLink} from '../src/deeplink';
import log from 'electron-log';
import {setupAutoUpdater} from '../src/auto-update';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Windows {
  main: BrowserWindow | null;
  quick: BrowserWindow | null;
  tray: Tray | null;
}

export const appWindows: Windows = {
  main: null,
  quick: null,
  tray: null,
};

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  if (!appWindows.main || appWindows.main.isDestroyed()) {
    appWindows.main = await createMainWindow();
    registerDeepLink(appWindows.main);
    setupAutoUpdater();
  }

  if (appWindows.main.isMinimized()) {
    appWindows.main.restore();
  }

  if (!appWindows.main.isVisible()) {
    appWindows.main.show();
  }

  appWindows.main.focus();

  return appWindows.main;
}

export function registerShortcut() {
  // Register a global shortcut
  const isRegistered = globalShortcut.register('CommandOrControl+;', () => {
    restoreOrCreateQuickWindow(true);
  });

  if (isRegistered) {
    log.info('Global shortcut registered successfully!');
  } else {
    log.info('Failed to register the global shortcut.');
  }
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateQuickWindow(show = false) {
  if (!appWindows.quick || appWindows.quick.isDestroyed()) {
    appWindows.quick = await createQuickWindow(show);
    registerQuickStates(appWindows.quick);

    if (!show) {
      return;
    }
  }

  // Reposition window based on current cursor position
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const {width} = currentDisplay.workArea;
  const {bounds} = currentDisplay;

  // Update window position to top-right of current display
  appWindows.quick.setPosition(bounds.x + width - 500 - 20, bounds.y + 60);

  // Ensure it remains on top
  appWindows.quick.setAlwaysOnTop(true, 'screen-saver', 2);

  if (!appWindows.quick.isVisible()) {
    appWindows.quick.show();
    appWindows.quick.focus();
  }
}

export async function setTray() {
  if (appWindows.tray) {
    return appWindows.tray;
  }

  const icon = nativeImage.createFromPath(
    path.join(__dirname, '/../../../buildResources/iconTemplate.png'),
  );
  appWindows.tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([{role: 'quit'}]);

  appWindows.tray.setContextMenu(contextMenu);

  return appWindows.tray;
}
