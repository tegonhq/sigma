import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useScope } from 'hooks/use-scope';

import { useReadNotificationtMutation } from 'services/notifications';

import { useContextStore } from 'store/global-context-provider';

import { Header } from './header';
import { InboxConversation } from './inbox-conversation';
import { InboxList } from './inbox-list';

export const Inbox = observer(() => {
  useScope(SCOPES.INBOX);
  const { notificationsStore } = useContextStore();

  const [currentNotification, setCurrentNotification] =
    React.useState(undefined);
  const notification = notificationsStore.getNotification(currentNotification);

  const { mutate: readNotification } = useReadNotificationtMutation({});

  const getActivityId = () => {
    return notification?.modelId;
  };

  React.useEffect(() => {
    if (notification && !notification?.read) {
      readNotification(currentNotification);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  return (
    <RightSideLayout header={<Header notificationId={notification?.id} />}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          maxSize={50}
          defaultSize={24}
          minSize={16}
          collapsible
          collapsedSize={16}
          className="h-[calc(100vh_-_54px)]"
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
          {notification && <InboxConversation activityId={getActivityId()} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </RightSideLayout>
  );
});
