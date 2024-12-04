import {app, BrowserWindow, Tray, nativeImage} from 'electron';
import path, {dirname, join} from 'node:path';

import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import {fileURLToPath} from 'node:url';

// Initialize Fastify
const fastify = Fastify({logger: true});
let tray;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Start Fastify server
const startFastifyServer = async () => {
  fastify.listen({port: 8000});
};

async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    // frame: false,
    minWidth: 700, // Set minimum width
    minHeight: 700, // Set minimum height
    resizable: true,
    movable: true,
    icon: path.join(__dirname, '/../../../buildResources/icon.png'),
    frame: false,
    transparent: true,
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

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * Load the main page of the main window.
   */
  browserWindow.loadURL('http://localhost:8000');

  return browserWindow;
}

async function setTray(window: BrowserWindow) {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '/../../../buildResources/iconTemplate.png'),
  );
  tray = new Tray(icon);

  tray.on('click', () => {
    window.show();
  });
}

// Register the proxy for API requests to localhost:3001
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3001',
  prefix: '/api', // only proxy requests starting with /api
  rewritePrefix: '/', // keep the /api prefix in the proxied request
  http2: false, // set to true if using HTTP/2
  websocket: true,
});

// Register the proxy for other requests to localhost:3000
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3000',
  prefix: '/', // proxy all other requests
  rewritePrefix: '/', // keep the original path
  http2: false, // set to true if using HTTP/2
  websocket: true,
});

// Start everything
app.whenReady().then(async () => {
  await startFastifyServer();
});

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();

  await setTray(window);
}
