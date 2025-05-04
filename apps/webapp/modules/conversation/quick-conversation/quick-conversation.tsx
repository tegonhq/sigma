import { UserTypeEnum } from '@sigma/types';
import { cn, LoaderLine, useToast } from '@tegonhq/ui';
import React from 'react';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useConversationHistory } from 'hooks/conversations';

import {
  useCreateConversationHistoryMutation,
  useCreateConversationMutation,
  useStreamConversationMutation,
} from 'services/conversations';

import { UserContext } from 'store/user-context';

import { ConversationItem } from '../conversation-item';
import { ConversationTextarea } from '../conversation-textarea';
import { StreamingConversation } from '../streaming-conversation';

export const QuickConverstion = () => {
  const [conversationHistoryId, setConversationHistoryId] =
    React.useState(undefined);
  const [conversationId, setConversationId] = React.useState(undefined);
  const user = React.useContext(UserContext);
  const { conversationHistory } = useConversationHistory(conversationId);
  console.log(conversationId, conversationHistory);
  const { mutate: createConversation } = useCreateConversationMutation({});
  const { toast } = useToast();

  const {
    mutate: streamConversation,
    isLoading,
    thoughts,
    responses,
  } = useStreamConversationMutation();
  const { mutate: createConversationHistory } =
    useCreateConversationHistoryMutation({});

  const onSend = (text: string, agents: string[], title: string) => {
    if (isLoading) {
      return;
    }

    if (conversationId) {
      createConversationHistory(
        {
          message: text,
          userType: UserTypeEnum.User,
          userId: user.id,
          conversationId,
          context: { agents },
        },
        {
          onSuccess: (data) => {
            setConversationHistoryId(data.id);

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
          context: { agents },
          title,
        },
        {
          onSuccess: (data) => {
            setConversationId(data.id);
            setConversationHistoryId(data.ConversationHistory[0].id);
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
            const current = conversationHistoryId === ch.id;

            if (reached === true && isLoading) {
              return null;
            }

            if (conversationHistoryId === ch.id) {
              reached = true;
            }

            console.log(current, reached, ch.id);

            return (
              <ConversationItem key={index} conversationHistoryId={ch.id} />
            );
          },
        )}
      </>
    );
  };

  return (
    <>
      <ScrollAreaWithAutoScroll className="relative text-sm mt-4">
        {getConversations()}

        {isLoading && (
          <StreamingConversation messages={responses} thoughts={thoughts} />
        )}

        {isLoading && (
          <div className="flex flex-wrap p-1 px-1 mt-2 gap-1">
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
      </ScrollAreaWithAutoScroll>
      <ConversationTextarea onSend={onSend} />
    </>
  );
};
