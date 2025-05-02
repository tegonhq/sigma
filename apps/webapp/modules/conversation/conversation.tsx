import { UserTypeEnum } from '@sigma/types';
import { cn, LoaderLine, useToast } from '@tegonhq/ui';
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
import { StreamingConversation } from './streaming-conversation';
import { useConversationContext } from './use-conversation-context';

export const Conversation = observer(() => {
  const { commonStore } = useContextStore();
  const { toast } = useToast();

  const { conversationHistory } = useConversationHistory(
    commonStore.currentConversationId,
  );

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
  const { mutate: createConversation } = useCreateConversationMutation({});

  const pageId = useConversationContext();

  const onSend = (text: string, agents: string[], title: string) => {
    if (isLoading) {
      return;
    }

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

          onError: (data) => {
            const errorMessage = data.response?.data?.message;
            toast({
              title: 'Conversation error',
              description: errorMessage ?? 'Conversation creation failed',
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
          title,
        },
        {
          onSuccess: (data) => {
            commonStore.update({ currentConversationId: data.id });
            streamConversation({
              conversationHistoryId: data.ConversationHistory[0].id,
            });
          },
          onError: (data) => {
            const errorMessage = data.response?.data?.message;
            toast({
              title: 'Conversation error',
              description: errorMessage ?? 'Conversation creation failed',
            });
          },
        },
      );
    }
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
    <div className="flex flex-col h-[calc(100vh_-_3.5rem)]">
      <div className="grow overflow-hidden">
        <div className="flex flex-col h-full justify-end overflow-hidden">
          <ScrollAreaWithAutoScroll>
            {getConversations()}
            {isLoading && (
              <StreamingConversation messages={responses} thoughts={thoughts} />
            )}
          </ScrollAreaWithAutoScroll>

          {isLoading && (
            <div className="flex flex-wrap p-1 px-3 mt-2 gap-1">
              <div
                className={cn(
                  'px-2 py-0 w-full flex flex-col items-start gap-1',
                )}
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
      </div>
    </div>
  );
});
