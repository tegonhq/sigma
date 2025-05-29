import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useScope } from 'hooks/use-scope';

import { InboxConversation } from './inbox-conversation';
import { NewConversation } from './new-conversation';
import { useApplication } from 'hooks/application';

export const Assistant = observer(() => {
  useScope(SCOPES.INBOX);

  const { activeTab } = useApplication();

  // const getActivityId = () => {
  //   return conversation?.modelId;
  // };

  // React.useEffect(() => {
  //   if (conversation && !conversation?.read) {
  //     readNotification(currentNotification);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [conversation]);

  return (
    <RightSideLayout>
      <div className={cn('h-[calc(100vh_-_48px)] flex flex-col pt-10')}>
        {activeTab.conversation_id ? (
          <InboxConversation conversationId={activeTab.conversation_id} />
        ) : (
          <NewConversation />
        )}
      </div>
    </RightSideLayout>
  );
});
