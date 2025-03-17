import type {UpdateCheckResult} from 'electron-updater';
import electronUpdater from 'electron-updater';

import type {SemVer} from 'semver';
import {parse} from 'semver';
import type {IpcMainEvent} from 'electron';
import {ipcMain} from 'electron';
import {appWindows} from '../windows';

const {autoUpdater} = electronUpdater;

// Add this at the top of the file with other imports
type UpdateChannel = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (...args: any[]) => void;
};

export const AUTO_UPDATE_CHANNELS = {
  CHANNEL: 'auto-update',
  TYPES: {
    ERROR: 'error',
    CHECKING: 'checking',
    AVAILABLE: 'available',
    NOT_AVAILABLE: 'not-available',
    PROGRESS: 'progress',
    DOWNLOADED: 'downloaded',
    DOWNLOAD_START: 'download-start',
    DOWNLOAD_END: 'download-end',
  },
} as const;

export const setupAutoUpdater = () => {
  let downloadingUpdate = false;
  let latestQueriedVersion = autoUpdater.currentVersion; // "0.5.0"
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoDownload = false;

  const updateChannels: UpdateChannel[] = [
    {
      name: 'error',
      handler: error => {
        appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
          type: AUTO_UPDATE_CHANNELS.TYPES.ERROR,
          payload: error,
        });
      },
    },
    {
      name: 'checking-for-update',
      handler: () => {
        appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
          type: AUTO_UPDATE_CHANNELS.TYPES.CHECKING,
        });
      },
    },
    {
      name: 'update-available',
      handler: release => {
        appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
          type: AUTO_UPDATE_CHANNELS.TYPES.AVAILABLE,
          payload: release,
        });
      },
    },
    {
      name: 'update-not-available',
      handler: release => {
        appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
          type: AUTO_UPDATE_CHANNELS.TYPES.NOT_AVAILABLE,
          payload: release,
        });
      },
    },
    {
      name: 'download-progress',
      handler: progress => {
        appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
          type: AUTO_UPDATE_CHANNELS.TYPES.PROGRESS,
          payload: progress,
        });
      },
    },
    {
      name: 'update-downloaded',
      handler: release => {
        appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
          type: AUTO_UPDATE_CHANNELS.TYPES.DOWNLOADED,
          payload: release,
        });
      },
    },
  ];

  // Register all channels
  updateChannels.forEach(channel => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoUpdater.on(channel.name as any, channel.handler);
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
    const updateVersion = parse(update?.updateInfo?.version); // "0.5.1"
    if (updateVersion && isNewVersion(updateVersion) && !downloadingUpdate) {
      downloadingUpdate = true;
      appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
        type: AUTO_UPDATE_CHANNELS.TYPES.DOWNLOAD_START,
      });
      autoUpdater
        .downloadUpdate()
        .then(() => {
          downloadingUpdate = false;
          latestQueriedVersion = updateVersion;
          appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
            type: AUTO_UPDATE_CHANNELS.TYPES.DOWNLOAD_END,
          });
        })
        .catch(() => {
          appWindows.main.webContents.send(AUTO_UPDATE_CHANNELS.CHANNEL, {
            type: AUTO_UPDATE_CHANNELS.TYPES.DOWNLOAD_END,
          });
          downloadingUpdate = false;
        });
    }
  };

  const checkForUpdate = async () => {
    const update = await queryUpdateVersion();
    if (update) {
      downloadUpdate(update);
    }

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
