import { UserTypeEnum } from '@sigma/types';
import { cn, LoaderLine } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useConversationHistory } from 'hooks/conversations';

import {
  useCreateConversationHistoryMutation,
  useCreateConversationMutation,
  useStreamConversationMutation,
} from 'services/conversations';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

import { ConversationItem } from './conversation-item';
import { ConversationTextarea } from './conversation-textarea';
import { useConversationContext } from './use-conversation-context';

export const Conversation = observer(() => {
  const { commonStore } = useContextStore();

  const { conversationHistory, conversation } = useConversationHistory(
    commonStore.currentConversationId,
  );

  const user = React.useContext(UserContext);
  const {
    mutate: streamConversation,
    isLoading,
    thoughts,
  } = useStreamConversationMutation();
  const { mutate: createConversationHistory } =
    useCreateConversationHistoryMutation({});
  const { mutate: createConversation } = useCreateConversationMutation({});

  const pageId = useConversationContext();

  React.useEffect(() => {
    if (conversation?.pageId && conversation.pageId !== pageId) {
      commonStore.update({ currentConversationId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, pageId]);

  const onSend = (text: string, agents: string[]) => {
    if (commonStore.currentConversationId) {
      createConversationHistory(
        {
          message: text,
          userType: UserTypeEnum.User,
          userId: user.id,
          conversationId: commonStore.currentConversationId,
          context: { agents },
        },
        {
          onSuccess: (data) => {
            streamConversation({
              conversationHistoryId: data.id,
            });
          },
        },
      );
    } else {
      createConversation(
        {
          message: text,
          userType: UserTypeEnum.User,
          pageId,
          context: { agents },
        },
        {
          onSuccess: (data) => {
            commonStore.update({ currentConversationId: data.id });
            streamConversation({
              conversationHistoryId: data.ConversationHistory[0].id,
            });
          },
        },
      );
    }
  };

  const lastThought = thoughts[thoughts.length - 1];

  return (
    <div className="flex flex-col h-[calc(100vh_-_3.5rem)]">
      <div className="grow overflow-hidden">
        <div className="flex flex-col h-full justify-end overflow-hidden">
          <ScrollAreaWithAutoScroll>
            {conversationHistory.map(
              (conversationHistory: ConversationHistoryType, index: number) => (
                <ConversationItem
                  key={index}
                  conversationHistoryId={conversationHistory.id}
                />
              ),
            )}
          </ScrollAreaWithAutoScroll>

          {isLoading && (
            <div className="flex flex-wrap p-3 gap-1">
              <div
                className={cn(
                  'px-2 py-2 w-full flex flex-col items-start gap-1',
                )}
              >
                <div
                  className={cn(
                    'w-full flex items-start gap-1 rounded-md text-sm',
                  )}
                >
                  <LoaderLine size={18} className="animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking</p>
                </div>
                {lastThought && (
                  <p
                    className="text-sm text-muted-foreground flex flex-wrap"
                    dangerouslySetInnerHTML={{ __html: lastThought.message }}
                  />
                )}
              </div>
            </div>
          )}

          <ConversationTextarea onSend={onSend} />
        </div>
      </div>
    </div>
  );
});
