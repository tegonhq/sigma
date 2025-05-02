import {app, BrowserWindow} from 'electron';

/**
 * ensureSafeQuitAndInstall
 *
 * @access  public
 * @return  void
 */
export function ensureSafeQuitAndInstall() {
  app.removeAllListeners('window-all-closed');
  const browserWindows = BrowserWindow.getAllWindows();
  for (const browserWindow of browserWindows) {
    browserWindow.removeAllListeners('close');
  }
}
