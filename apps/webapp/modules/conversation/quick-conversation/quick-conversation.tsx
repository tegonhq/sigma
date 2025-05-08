import { UserTypeEnum } from '@sigma/types';
import { ArrowLeft, Button, cn, LoaderLine, useToast } from '@tegonhq/ui';
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
import { observer } from 'mobx-react-lite';

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
    const [conversationHistoryId, setConversationHistoryId] =
      React.useState(undefined);
    const user = React.useContext(UserContext);
    const { conversationHistory } = useConversationHistory(conversationId);
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
              if (reached === true && isLoading) {
                return null;
              }

              if (conversationHistoryId === ch.id) {
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
      <>
        <div className="flex py-2 px-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            <ArrowLeft size={16} />
          </Button>
        </div>
        <ScrollAreaWithAutoScroll className={cn('relative mt-0')}>
          {getConversations()}

          {isLoading && (
            <StreamingConversation messages={responses} thoughts={thoughts} />
          )}
        </ScrollAreaWithAutoScroll>
        <ConversationTextarea
          onSend={onSend}
          defaultValue={defaultValue}
          className="m-2 mt-0 mb-3 bg-background-3"
          isLoading={isLoading}
        />
      </>
    );
  },
);
