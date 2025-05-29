import { useToast } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ConversationItem } from 'modules/conversation/conversation-item';
import { ConversationTextarea } from 'modules/conversation/conversation-textarea';
import { StreamingConversation } from 'modules/conversation/streaming-conversation';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useApplication } from 'hooks/application';
import { useConversationHistory } from 'hooks/conversations';

import {
  useCreateConversationMutation,
  useGetCurrentConversationRun,
} from 'services/conversations';

import { useContextStore } from 'store/global-context-provider';

interface InboxConversationProps {
  conversationId: string;
}

export const InboxConversation = observer(
  ({ conversationId }: InboxConversationProps) => {
    const { conversationsStore } = useContextStore();
    const conversation =
      conversationsStore.getConversationWithId(conversationId);
    const [conversationResponse, setConversationResponse] =
      React.useState(undefined);
    const { data: initialRunResponse } =
      useGetCurrentConversationRun(conversationId);
    const { updateConversationId } = useApplication();

    const { mutate: createConversation } = useCreateConversationMutation({});
    const { toast } = useToast();

    const { conversationHistory } = useConversationHistory(conversation?.id);

    React.useEffect(() => {
      if (initialRunResponse) {
        setConversationResponse(initialRunResponse);
      }
    }, [initialRunResponse]);

    const onSend = (text: string, agents: string[]) => {
      if (!!conversationResponse) {
        return;
      }

      createConversation(
        {
          message: text,
          context: { agents },
          title: text,
          conversationId: conversation?.id,
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

    return (
      <div className="flex flex-col h-full justify-center w-full items-center overflow-auto">
        <div className="flex flex-col justify-end overflow-hidden h-full w-full">
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

          <div className="flex flex-col w-full items-center">
            <div className="max-w-[97ch] w-full">
              <ConversationTextarea
                onSend={onSend}
                className="bg-grayAlpha-100 m-4 mt-0 w-full"
                isLoading={!!conversationResponse}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
