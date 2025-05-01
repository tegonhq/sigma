import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@tegonhq/ui';
import React from 'react';

import { RightSideLayout } from 'layouts/right-side-layout';

import { Header } from './header';
import { InboxList } from './inbox-list';

export function Inbox() {
  return (
    <RightSideLayout header={<Header />}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          maxSize={50}
          defaultSize={24}
          minSize={16}
          collapsible
          collapsedSize={16}
        >
          <div className="flex flex-col h-full">
            <h2 className="text-lg pl-4 pt-4 font-medium"> Inbox </h2>
            <InboxList />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          collapsible
          collapsedSize={0}
          className="flex flex-col items-center justify-center"
        >
          {/* <NotificationRightSide /> */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </RightSideLayout>
  );
}
