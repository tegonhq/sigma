import { useLocalCommonState } from 'common/use-local-state';

import { useIPC } from 'hooks/ipc';

export const useWindowState = () => {
  const ipcRenderer = useIPC();
  const [minimised, setMinimised] = useLocalCommonState('minimized', true);

  ipcRenderer.onWindowStateChange((state: string) => {
    if (state === 'maximized') {
      setMinimised(false);
    }

    if (state === 'restored') {
      setMinimised(true);
    }
  });

  return minimised;
};
