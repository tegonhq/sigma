import {app, BrowserWindow} from 'electron';
import path, {dirname, join} from 'node:path';
import log from 'electron-log';
import {fileURLToPath} from 'node:url';
import {PORT} from '../utils';

// Initialize Fastify
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createMainWindow() {
  log.info(app.getAppPath());
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    // frame: false,
    minWidth: 700, // Set minimum width
    minHeight: 700, // Set minimum height
    resizable: true,
    movable: true,
    hasShadow: true,
    skipTaskbar: true, // Hides it from the taskbar
    icon: path.join(__dirname, '/../../../buildResources/icon.png'),
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();
  });

  /**
   * Load the main page of the main window.
   */
  browserWindow.loadURL(`http://localhost:${PORT}`);

  return browserWindow;
}
