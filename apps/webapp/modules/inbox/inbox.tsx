import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@tegonhq/ui';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useScope } from 'hooks/use-scope';

import { Header } from './header';
import { InboxConversation } from './inbox-conversation';
import { InboxList } from './inbox-list';
import { observer } from 'mobx-react-lite';
import { useContextStore } from 'store/global-context-provider';

export const Inbox = observer(() => {
  useScope(SCOPES.INBOX);
  const { notificationsStore } = useContextStore();

  const [currentNotification, setCurrentNotification] =
    React.useState(undefined);

  const getActivityId = () => {
    const notification =
      notificationsStore.getNotification(currentNotification);
    return notification.modelId;
  };

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
            <InboxList
              currentNotification={currentNotification}
              setCurrentNotification={setCurrentNotification}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle className="border-border border-[0.5px] h-full" />
        <ResizablePanel
          collapsible
          collapsedSize={0}
          className="flex flex-col w-full h-[calc(100vh_-_54px)]"
        >
          {currentNotification && (
            <InboxConversation activityId={getActivityId()} />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </RightSideLayout>
  );
});
