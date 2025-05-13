import { ArrowLeft, Button, cn, useToast } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useConversationHistory } from 'hooks/conversations';

import { useCreateConversationMutation } from 'services/conversations';

import { ConversationItem } from '../conversation-item';
import { ConversationTextarea } from '../conversation-textarea';
import { StreamingConversation } from '../streaming-conversation';

interface QuickConverstionProps {
  onClose: () => void;
  conversationId: string;
  setConversationId: (value: string | undefined) => void;
  defaultValue?: string;
}

export const QuickConverstion = observer(
  ({
    onClose,
    conversationId,
    setConversationId,
    defaultValue,
  }: QuickConverstionProps) => {
    const { conversationHistory } = useConversationHistory(conversationId);
    const { mutate: createConversation } = useCreateConversationMutation({});
    const { toast } = useToast();
    const [conversationResponse, setConversationResponse] =
      React.useState(undefined);

    const onSend = (text: string, agents: string[], title: string) => {
      if (!!conversationResponse) {
        return;
      }

      createConversation(
        {
          message: text,
          context: { agents },
          title,
          conversationId,
        },
        {
          onSuccess: (data) => {
            setConversationId(data.conversationId);
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
      <>
        <div className="flex py-2 px-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            <ArrowLeft size={16} />
          </Button>
        </div>
        <ScrollAreaWithAutoScroll className={cn('relative mt-0')}>
          {getConversations()}

          {conversationResponse && (
            <StreamingConversation
              runId={conversationResponse.id}
              token={conversationResponse.token}
              afterStreaming={() => setConversationResponse(undefined)}
            />
          )}
        </ScrollAreaWithAutoScroll>
        <ConversationTextarea
          onSend={onSend}
          defaultValue={defaultValue}
          className="m-2 mt-0 mb-3 bg-background-3"
          isLoading={!!conversationResponse}
        />
      </>
    );
  },
);
