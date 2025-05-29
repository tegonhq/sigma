import { Loader, useToast } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useApplication } from 'hooks/application';
import { useConversationHistory } from 'hooks/conversations';

import { useCreateConversationMutation } from 'services/conversations';
import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { ConversationItem } from './conversation-item';
import { ConversationTextarea } from './conversation-textarea';
import { StreamingConversation } from './streaming-conversation';
import { useConversationContext } from './use-conversation-context';

interface ConversationProps {
  defaultValue?: string;
}

export const Conversation = observer(({ defaultValue }: ConversationProps) => {
  const { activeTab, updateConversationId } = useApplication();
  const { toast } = useToast();

  const { conversationHistory } = useConversationHistory(
    activeTab.conversation_id,
  );
  const { isLoading: integrationsLoading } = useGetIntegrationDefinitions();
  const [conversationResponse, setConversationResponse] =
    React.useState(undefined);

  const { mutate: createConversation } = useCreateConversationMutation({});

  const pageId = useConversationContext();

  const onSend = (text: string, agents: string[], title: string) => {
    if (conversationResponse) {
      return;
    }

    createConversation(
      {
        message: text,
        pageId,
        context: { agents },
        title,
        conversationId: activeTab.conversation_id,
      },
      {
        onSuccess: (data) => {
          updateConversationId(data.conversationId);
          setConversationResponse(data);
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
  };

  const getConversations = () => {
    const lastConversationHistoryId =
      conversationResponse?.conversationHistoryId;

    // First sort the conversation history by creation time
    const sortedConversationHistory = sort(conversationHistory).asc(
      (ch) => ch.createdAt,
    );

    const lastIndex = sortedConversationHistory.findIndex(
      (item) => item.id === lastConversationHistoryId,
    );

    // Filter out any conversation history items that come after the lastConversationHistoryId
    const filteredConversationHistory = lastConversationHistoryId
      ? sortedConversationHistory.filter((_ch, currentIndex: number) => {
          // Find the index of the last conversation history

          // Only keep items that come before or are the last conversation history
          return currentIndex <= lastIndex;
        })
      : sortedConversationHistory;

    return (
      <>
        {filteredConversationHistory.map(
          (ch: ConversationHistoryType, index: number) => {
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
    <div className="flex flex-col h-[calc(100vh_-_95px)] items-center">
      <div className="overflow-hidden w-full grow">
        <div className="flex flex-col h-full justify-start overflow-hidden">
          <ScrollAreaWithAutoScroll>
            {getConversations()}
            {conversationResponse && (
              <StreamingConversation
                runId={conversationResponse.id}
                token={conversationResponse.token}
                afterStreaming={() => setConversationResponse(undefined)}
              />
            )}
          </ScrollAreaWithAutoScroll>

          <div className="flex flex-col">
            <ConversationTextarea
              onSend={onSend}
              defaultValue={defaultValue}
              isLoading={conversationResponse}
              className="bg-background-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
