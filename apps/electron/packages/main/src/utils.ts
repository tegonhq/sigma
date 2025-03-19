/**
 * ensureSafeQuitAndInstall
 *
 * @access  public
 * @return  void
 */
export function ensureSafeQuitAndInstall() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const electron = require('electron');
  const app = electron.app;
  const BrowserWindow = electron.BrowserWindow;
  app.removeAllListeners('window-all-closed');
  const browserWindows = BrowserWindow.getAllWindows();
  for (const browserWindow of browserWindows) {
    browserWindow.removeAllListeners('close');
  }
}
