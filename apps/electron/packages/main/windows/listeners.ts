import type {BrowserWindow} from 'electron';
import {app, desktopCapturer, ipcMain, shell} from 'electron';
import path from 'node:path';
import log from 'electron-log';
import {integrationsInit} from '../src/integrations-init';

export function listeners(window: BrowserWindow) {
  // Listen for URL open requests
  ipcMain.on('open-url', (_event, url) => {
    log.info(url);
    shell.openExternal(url);
  });

  ipcMain.on('integrations-init', async () => {
    await integrationsInit();
  });

  ipcMain.handle('get-integrations-folder', () => {
    return path.join(app.getPath('userData'), 'integrations');
  });

  ipcMain.handle('get-sources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
    });

    return sources;
  });

  // Main window communication
  // Handle window-to-window communication
  ipcMain.on('from-quick-window', (_event, message) => {
    // Log the received message
    log.info('Window communication received:', message);

    // Forward the message to the main window if it exists
    if (window && !window.isDestroyed()) {
      if (!window.isFocused()) {
        window.focus();
        window.show();
      }

      window.webContents.send('from-windows', message);
    }
  });
}
