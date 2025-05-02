import { UserTypeEnum } from '@sigma/types';
import { cn, LoaderLine } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ConversationItem } from 'modules/conversation/conversation-item';
import { ConversationTextarea } from 'modules/conversation/conversation-textarea';
import { StreamingConversation } from 'modules/conversation/streaming-conversation';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useConversationHistory } from 'hooks/conversations';

import {
  useCreateConversationHistoryMutation,
  useStreamConversationMutation,
} from 'services/conversations';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

interface InboxConversationProps {
  activityId: string;
}

export const InboxConversation = observer(
  ({ activityId }: InboxConversationProps) => {
    const { commonStore, conversationsStore } = useContextStore();
    const conversation =
      conversationsStore.conversations[
        conversationsStore.conversations.length - 1
      ];

    const { conversationHistory } = useConversationHistory(conversation?.id);

    const user = React.useContext(UserContext);
    const {
      mutate: streamConversation,
      isLoading,
      thoughts,
      responses,
    } = useStreamConversationMutation();
    const {
      mutate: createConversationHistory,
      data: conversationHistoryCreated,
    } = useCreateConversationHistoryMutation({});

    const onSend = (text: string, agents: string[]) => {
      if (isLoading) {
        return;
      }

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
    };

    const getConversations = () => {
      let reached = false;

      return (
        <>
          {conversationHistory.map(
            (ch: ConversationHistoryType, index: number) => {
              if (reached === true && isLoading) {
                return null;
              }

              if (conversationHistoryCreated?.id === ch.id) {
                reached = true;
              }

              return (
                <ConversationItem key={index} conversationHistoryId={ch.id} />
              );
            },
          )}
        </>
      );
    };

    return (
      <div className="flex flex-col justify-end overflow-hidden h-full">
        <ScrollAreaWithAutoScroll>
          {getConversations()}
          {isLoading && (
            <StreamingConversation messages={responses} thoughts={thoughts} />
          )}
        </ScrollAreaWithAutoScroll>

        {isLoading && (
          <div className="flex flex-wrap p-1 px-3 mt-2 gap-1">
            <div
              className={cn('px-2 py-0 w-full flex flex-col items-start gap-1')}
            >
              <div
                className={cn(
                  'w-full flex items-start gap-1 rounded-md text-sm',
                )}
              >
                <LoaderLine size={18} className="animate-spin" />
                <p className="text-sm text-muted-foreground">Generating...</p>
              </div>
            </div>
          </div>
        )}

        <ConversationTextarea onSend={onSend} />
      </div>
    );
  },
);
