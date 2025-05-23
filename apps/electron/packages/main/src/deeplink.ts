import {Deeplink} from 'electron-deeplink';
import type {BrowserWindow} from 'electron';
import {app} from 'electron';

export const registerDeepLink = (mainWindow: BrowserWindow) => {
  const deeplink = new Deeplink({
    app,
    mainWindow,
    protocol: 'mysigma',
  });

  deeplink.on('received', link => {
    if (!link.startsWith('mysigma://')) return;
    const encoded = link.split('mysigma://')[1];
    if (!encoded) {
      throw new Error('Invalid sigma link!');
    }
    const [action, data] = Buffer.from(encoded, 'base64').toString().split(':');
    mainWindow.webContents.send('received-link', {action, data});
  });
};
