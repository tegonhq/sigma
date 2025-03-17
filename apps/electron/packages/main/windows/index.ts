import {globalShortcut, nativeImage, Tray, type BrowserWindow, screen} from 'electron';
import {createMainWindow} from './main';
import {createQuickWindow, recalculatePositionToDisplay, registerQuickStates} from './quick';

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
}

export function registerShortcut() {
  // Register a global shortcut
  const isRegistered = globalShortcut.register('CommandOrControl+Shift+K', () => {
    restoreOrCreateQuickWindow();
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
export async function restoreOrCreateQuickWindow() {
  if (!appWindows.quick || appWindows.quick.isDestroyed()) {
    log.info('destroyed\n');
    appWindows.quick = await createQuickWindow();
    registerQuickStates(appWindows.quick);
  }

  const focusScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

  const winBounds = appWindows.quick.getBounds();

  const originalScreen = screen.getDisplayNearestPoint({
    x: winBounds.x,
    y: winBounds.y,
  });

  if (focusScreen.id !== originalScreen.id) {
    const newPosition = recalculatePositionToDisplay(
      {x: winBounds.x, y: winBounds.y},
      originalScreen,
      focusScreen,
    );
    appWindows.quick.setPosition(newPosition.x, newPosition.y);
  }

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

  appWindows.tray.on('click', async () => {
    await restoreOrCreateQuickWindow();
  });

  return appWindows.tray;
}
