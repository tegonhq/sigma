import {Deeplink} from 'electron-deeplink';
import type {BrowserWindow} from 'electron';
import {app} from 'electron';

export const registerDeepLink = (mainWindow: BrowserWindow) => {
  const deeplink = new Deeplink({
    app,
    mainWindow,
    protocol: 'sol',
  });

  deeplink.on('received', link => {
    if (!link.startsWith('sol://')) return;
    const encoded = link.split('sol://')[1];
    if (!encoded) {
      throw new Error('Invalid sol link!');
    }
    const [action, data] = Buffer.from(encoded, 'base64').toString().split(':');
    mainWindow.webContents.send('received-link', {action, data});
  });
};
