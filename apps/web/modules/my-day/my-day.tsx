import { Button } from '@sigma/ui/components/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ImperativePanelHandle,
} from '@sigma/ui/components/resizable';
import { RightSidebarClosed, RightSidebarOpen } from '@sigma/ui/icons';
import React, { useRef } from 'react';

import { Day } from './day';
import { RightSidebar } from './right-sidebar';
import { observer } from 'mobx-react-lite';

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
        <Button variant="ghost" onClick={() => togglePanel()}>
          {open ? (
            <RightSidebarOpen size={18} />
          ) : (
            <RightSidebarClosed size={18} />
          )}
        </Button>
      </div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel order={1} className="flex flex-col">
          <Day />
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel
          maxSize={40}
          defaultSize={15}
          id="sidebar-calendar"
          minSize={15}
          onCollapse={() => setOpen(false)}
          onExpand={() => setOpen(true)}
          collapsible
          order={2}
          ref={ref}
          collapsedSize={0}
        >
          <RightSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
});
