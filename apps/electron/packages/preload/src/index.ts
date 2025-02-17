/**
 * @module preload
 */

import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';

// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import type {IpcRendererEvent} from 'electron';
import {contextBridge, ipcRenderer} from 'electron';

export type Channels = 'ipc';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    onWindowStateChange: (callback: (state: string) => void) =>
      ipcRenderer.on('window-state', (event, state) => callback(state)),
    convertPathToUrl: (filePath: string) => ipcRenderer.invoke('convert-path-to-url', filePath),
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    openUrl: (url: string) => {
      ipcRenderer.send('open-url', url);
    },
    getIntegrationsFolder: () => ipcRenderer.invoke('get-integrations-folder'),
    getSources: () => ipcRenderer.invoke('get-sources'),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

export {sha256sum, versions};
