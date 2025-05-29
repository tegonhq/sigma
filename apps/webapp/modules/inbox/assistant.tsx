import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useScope } from 'hooks/use-scope';

import { useContextStore } from 'store/global-context-provider';

import { InboxConversation } from './inbox-conversation';
import { NewConversation } from './new-conversation';

export const Assistant = observer(() => {
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
    <RightSideLayout>
      <div className={cn('h-[calc(100vh_-_48px)] flex flex-col pt-10')}>
        {conversation ? (
          <InboxConversation conversationId={conversation.id} />
        ) : (
          <NewConversation startConversation={startConversation} />
        )}
      </div>
    </RightSideLayout>
  );
});
