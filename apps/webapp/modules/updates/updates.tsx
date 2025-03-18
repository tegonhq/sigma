import { useIPC } from 'hooks/ipc';
import React from 'react';

export const Updates = () => {
  const ipc = useIPC();

  React.useEffect(() => {
    subscribeToUpdateEvents();
  }, []);

  const updates = (event: any, value: any) => {
    console.log(event, value);
  };

  const subscribeToUpdateEvents = () => {
    if (ipc) {
      ipc.getAutoUpdates(updates);
    }
  };

  return <div className="fixed bottom-0 right-0 bg-background"></div>;
};
