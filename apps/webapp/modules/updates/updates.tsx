import { Button } from '@tegonhq/ui';
import React from 'react';

import { useIPC } from 'hooks/ipc';

export const Updates = () => {
  const ipc = useIPC();

  const [updateState, setUpdateState] = React.useState<{
    available: boolean;
    downloading: boolean;
    downloadComplete: boolean;
    progress: number;
  }>({
    available: false,
    downloading: false,
    downloadComplete: false,
    progress: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates = (_event: string, value: any) => {
    switch (value.type) {
      case 'available':
        setUpdateState((prev) => ({ ...prev, available: true }));
        break;

      case 'download-start':
        setUpdateState((prev) => ({
          ...prev,
          downloading: true,
          available: false,
        }));
        break;

      case 'progress':
        setUpdateState((prev) => ({
          ...prev,
          progress: Math.floor(value.payload.percent),
        }));
        break;

      case 'downloaded':
        setUpdateState((prev) => ({
          ...prev,
          downloading: false,
          downloadComplete: true,
          available: false,
        }));

        break;
    }
  };

  const handleRestart = () => {
    if (ipc) {
      ipc.restartAndInstall();
    }
  };

  React.useEffect(() => {
    subscribeToUpdateEvents();
  }, []);

  const subscribeToUpdateEvents = () => {
    if (ipc) {
      ipc.getAutoUpdates(updates);
    }
  };

  if (
    !updateState.available &&
    !updateState.downloading &&
    !updateState.downloadComplete
  ) {
    return null;
  }

  return (
    <div className="flex p-3 bg-background-2 rounded-lg shadow-1 text-xs">
      {updateState.available && (
        <div className="flex flex-col gap-2">
          <p>A new version is available for download</p>
        </div>
      )}

      {updateState.downloading && (
        <div className="flex flex-col gap-2">
          <p>Downloading update... {Math.round(updateState.progress)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${updateState.progress}%` }}
            />
          </div>
        </div>
      )}

      {updateState.downloadComplete && (
        <div className="flex flex-col gap-2">
          <p>Update ready to install</p>
          <Button variant="secondary" onClick={handleRestart}>
            Install
          </Button>
        </div>
      )}
    </div>
  );
};
