import type {BrowserWindow} from 'electron';
import {app, ipcMain, shell} from 'electron';
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

  ipcMain.handle('get-integauto-updaterations-folder', () => {
    return path.join(app.getPath('userData'), 'integrations');
  });

  // Window Fullscreen events
  window.on('enter-full-screen', () => {
    window.webContents.send('fullscreen-changed', true);
  });

  window.on('leave-full-screen', () => {
    window.webContents.send('fullscreen-changed', false);
  });

  // Instead of closing, hide the window when Cmd+W is pressed
  window.on('close', event => {
    if (process.platform === 'darwin') {
      event.preventDefault(); // Prevent the default close behavior
      window.hide(); // Hide the window instead
    }
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
