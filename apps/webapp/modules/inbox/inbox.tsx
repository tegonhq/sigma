import { ResizablePanel, ResizablePanelGroup } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useScope } from 'hooks/use-scope';

import { useContextStore } from 'store/global-context-provider';

import { Header } from './header';
import { InboxConversation } from './inbox-conversation';
import { InboxList } from './inbox-list';
import { NewConversation } from './new-conversation';

export const Inbox = observer(() => {
  useScope(SCOPES.INBOX);
  const { conversationsStore } = useContextStore();

  const [currentConversation, setCurrentConversation] =
    React.useState(undefined);
  const conversation =
    conversationsStore.getConversationWithId(currentConversation);

  // const getActivityId = () => {
  //   return conversation?.modelId;
  // };

  // React.useEffect(() => {
  //   if (conversation && !conversation?.read) {
  //     readNotification(currentNotification);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [conversation]);

  const startConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
  };

  return (
    <RightSideLayout header={<></>}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          maxSize={20}
          defaultSize={20}
          minSize={20}
          collapsible
          collapsedSize={20}
          className="h-[calc(100vh)] border-r-1 border-border"
        >
          <Header
            conversationId={conversation?.id}
            newConversation={() => setCurrentConversation(undefined)}
          />
          <div className="flex flex-col h-full">
            <InboxList
              currentConversation={currentConversation}
              setCurrentConversation={setCurrentConversation}
            />
          </div>
        </ResizablePanel>

        <ResizablePanel
          collapsible
          collapsedSize={0}
          className="flex flex-col w-full h-[calc(100vh_-_1rem)]"
        >
          {conversation ? (
            <InboxConversation conversationId={conversation.id} />
          ) : (
            <NewConversation startConversation={startConversation} />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </RightSideLayout>
  );
});
