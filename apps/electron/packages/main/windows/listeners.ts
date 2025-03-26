import {app, desktopCapturer, ipcMain, shell} from 'electron';
import path from 'node:path';
import log from 'electron-log';
import {integrationsInit} from '../src/integrations-init';

export function listeners() {
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
}
