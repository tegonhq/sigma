import {ipcMain, shell} from 'electron';
export function listeners() {
  // Listen for URL open requests
  ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url);
  });
}
