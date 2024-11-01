import { Button } from '@sigma/ui/components/button';
import { type ImperativePanelHandle } from '@sigma/ui/components/resizable';
import { CalendarLine } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';

import { Day } from './day';

export const MyDay = observer(() => {
  const ref = useRef<ImperativePanelHandle>(null);
  const [open, setOpen] = React.useState(true);

  const togglePanel = () => {
    const panel = ref.current;

    if (panel && panel.isExpanded()) {
      panel.collapse();
      return;
    }

    if (panel && !panel.isExpanded()) {
      panel.expand();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute right-2 flex justify-end top-1 py-1.5 z-10">
        <Button
          variant={open ? 'secondary' : 'ghost'}
          onClick={() => togglePanel()}
        >
          {open ? <CalendarLine size={18} /> : <CalendarLine size={18} />}
        </Button>
      </div>

      <Day />

      {/* <RightSidebar /> */}
    </div>
  );
});
