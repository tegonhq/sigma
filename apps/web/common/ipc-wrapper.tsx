import { observer } from 'mobx-react-lite';
import React from 'react';

import { useIPC } from 'hooks/ipc';

export const IPCWrapper = observer(() => {
  const ipcRenderer = useIPC();

  React.useEffect(() => {
    onMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMessage = () => {
    ipcRenderer.on(['ipc'], (data) => {
      console.log(data);
    });
  };
  return <></>;
});
