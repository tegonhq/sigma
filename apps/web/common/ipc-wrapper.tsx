import { observer } from 'mobx-react-lite';
import React from 'react';

import { useIPC } from 'hooks/ipc';
import { useIsElectron } from 'hooks/use-is-electron';

export const IPCWrapper = observer(() => {
  const ipcRenderer = useIPC();
  const isElectron = useIsElectron();

  React.useEffect(() => {
    if (isElectron) {
      onMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isElectron]);

  const onMessage = () => {
    ipcRenderer.on(['ipc'], (data) => {});
  };
  return <></>;
});
