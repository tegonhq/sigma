import React from 'react';

import { useApplication } from 'hooks/application';
import { useIPC } from 'hooks/ipc';

import { TabViewType } from 'store/application';

export const useWindowListener = () => {
  const ipc = useIPC();

  const { updateTabType } = useApplication();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventFromOtherWindow = (_event: string, value: any) => {
    switch (value.type) {
      case 'List':
        updateTabType(0, TabViewType.LIST, { entityId: value.id });
        return;
      case 'Task':
        updateTabType(0, TabViewType.MY_TASKS, { entityId: value.id });
    }
  };

  React.useEffect(() => {
    subscribeToUpdateEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribeToUpdateEvents = () => {
    if (ipc) {
      ipc.fromOtherWindows(eventFromOtherWindow);
    }
  };
};
