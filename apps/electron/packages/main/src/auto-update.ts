import type {UpdateCheckResult} from 'electron-updater';
import electronUpdater from 'electron-updater';

import type {SemVer} from 'semver';
import {parse} from 'semver';
import type {IpcMainEvent} from 'electron';
import {ipcMain} from 'electron';
import {appWindows} from '../windows';

const {autoUpdater} = electronUpdater;

export const setupAutoUpdater = () => {
  let downloadingUpdate = false;
  let latestQueriedVersion = autoUpdater.currentVersion; // "0.5.0"
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoDownload = false;

  autoUpdater.on('error', error => {
    appWindows.main.webContents.send('auto-update-error', error);
  });

  autoUpdater.on('checking-for-update', () => {
    appWindows.main.webContents.send('checking-for-update');
  });

  autoUpdater.on('update-available', release => {
    appWindows.main.webContents.send('update-available', release);
  });

  autoUpdater.on('update-not-available', release => {
    appWindows.main.webContents.send('update-not-available', release);
  });

  autoUpdater.on('download-progress', progress => {
    appWindows.main.webContents.send('download-progress', progress);
  });

  autoUpdater.on('update-downloaded', release => {
    appWindows.main.webContents.send('update-downloaded', release);
  });

  const isNewVersion = (incomingVersion: SemVer): boolean => {
    if (incomingVersion.major > latestQueriedVersion.major) return true;
    if (incomingVersion.minor > latestQueriedVersion.minor) return true;
    return incomingVersion.patch > latestQueriedVersion.patch;
  };

  const queryUpdateVersion = async (): Promise<UpdateCheckResult> => {
    return await autoUpdater.checkForUpdates();
  };

  const downloadUpdate = async (update: UpdateCheckResult) => {
    const updateVersion = parse(update.updateInfo.version); // "0.5.1"
    if (isNewVersion(updateVersion) && !downloadingUpdate) {
      downloadingUpdate = true;
      appWindows.main.webContents.send('download-start');
      autoUpdater
        .downloadUpdate()
        .then(() => {
          downloadingUpdate = false;
          latestQueriedVersion = updateVersion;
          appWindows.main.webContents.send('download-end');
        })
        .catch(() => {
          appWindows.main.webContents.send('download-end');
          downloadingUpdate = false;
        });
    }
  };

  const checkForUpdate = async () => {
    const update = await queryUpdateVersion();
    downloadUpdate(update);
    return update;
  };

  appWindows.main.once('ready-to-show', async () => {
    checkForUpdate();
  });

  setInterval(
    () => {
      checkForUpdate();
    },
    5 * 60 * 1000,
  );

  ipcMain?.handle('check-for-update', (_event: IpcMainEvent) => {
    return checkForUpdate();
  });
};
