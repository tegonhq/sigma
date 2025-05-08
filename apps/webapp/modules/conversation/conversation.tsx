import { UserTypeEnum } from '@sigma/types';
import { Loader, useToast } from '@tegonhq/ui';
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
import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

import { ConversationItem } from './conversation-item';
import { ConversationTextarea } from './conversation-textarea';
import { StreamingConversation } from './streaming-conversation';
import { useConversationContext } from './use-conversation-context';

interface ConversationProps {
  defaultValue?: string;
}

export const Conversation = observer(({ defaultValue }: ConversationProps) => {
  const { commonStore } = useContextStore();
  const { toast } = useToast();

  const { conversationHistory } = useConversationHistory(
    commonStore.currentConversationId,
  );
  const { isLoading: integrationsLoading } = useGetIntegrationDefinitions();

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

  if (integrationsLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh_-_3.5rem)] items-center">
      <div className="grow overflow-hidden w-full">
        <div className="flex flex-col h-full justify-start overflow-hidden">
          <ScrollAreaWithAutoScroll>
            {getConversations()}
            {isLoading && (
              <StreamingConversation messages={responses} thoughts={thoughts} />
            )}
          </ScrollAreaWithAutoScroll>

          <div className="flex flex-col">
            <ConversationTextarea
              onSend={onSend}
              defaultValue={defaultValue}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
