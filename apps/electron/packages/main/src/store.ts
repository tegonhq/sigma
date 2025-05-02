import {ipcMain} from 'electron';
import Store from 'electron-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const store: any = new Store();

export const registerStore = () => {
  // IPC listener
  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
  });
  ipcMain.on('electron-store-set', async (_event, key, val) => {
    store.set(key, val);
  });
  ipcMain.on('electron-store-delete', async (_event, val) => {
    store.delete(val);
  });
  return store;
};
