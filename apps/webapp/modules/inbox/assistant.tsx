import { cn } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { InboxConversation } from './inbox-conversation';
import { NewConversation } from './new-conversation';
import { useGetIntegrationDefinitions } from 'services/integration-definition';

export const Assistant = observer(() => {
  useScope(SCOPES.ASSISTANT);

  const { activeTab } = useApplication();
  const { isLoading } = useGetIntegrationDefinitions();

  // const getActivityId = () => {
  //   return conversation?.modelId;
  // };

  // React.useEffect(() => {
  //   if (conversation && !conversation?.read) {
  //     readNotification(currentNotification);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [conversation]);

  if (isLoading) {
    return null;
  }

  return (
    <div className={cn('h-[calc(100vh_-_40px)] flex flex-col pt-10')}>
      {activeTab.conversation_id ? (
        <InboxConversation conversationId={activeTab.conversation_id} />
      ) : (
        <NewConversation />
      )}
    </div>
  );
});
