import { UserTypeEnum } from '@sigma/types';
import { cn, LoaderLine } from '@tegonhq/ui';
import React from 'react';

import type { ConversationHistoryType } from 'common/types';
import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import { useConversationHistory } from 'hooks/conversations';

import {
  useCreateConversationHistoryMutation,
  useStreamConversationMutation,
} from 'services/conversations';

import { UserContext } from 'store/user-context';

import { ConversationItem } from '../conversation-item';
import { ConversationTextarea } from '../conversation-textarea';
import { StreamingConversation } from '../streaming-conversation';

interface QuickConversationInterface {
  defaultConversationHistoryId: string;
  conversationId: string;
}

export const QuickConverstion = ({
  defaultConversationHistoryId,
  conversationId,
}: QuickConversationInterface) => {
  const [conversationHistoryId, setConversationHistoryId] = React.useState(
    defaultConversationHistoryId,
  );
  const user = React.useContext(UserContext);
  const { conversationHistory } = useConversationHistory(conversationId);

  const {
    mutate: streamConversation,
    isLoading,
    thoughts,
    responses,
  } = useStreamConversationMutation();
  const { mutate: createConversationHistory } =
    useCreateConversationHistoryMutation({});

  React.useEffect(() => {
    streamConversation({
      conversationHistoryId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSend = (text: string, agents: string[]) => {
    if (isLoading) {
      return;
    }

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
  };

  const getConversations = () => {
    let reached = false;

    return (
      <>
        {conversationHistory.map(
          (ch: ConversationHistoryType, index: number) => {
            const current = conversationHistoryId === ch.id;

            if (!reached && !current) {
              return null;
            }

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
      <ScrollAreaWithAutoScroll className="h-full max-h-[600px]">
        {getConversations()}

        {isLoading && (
          <StreamingConversation messages={responses} thoughts={thoughts} />
        )}

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
      </ScrollAreaWithAutoScroll>
      <ConversationTextarea onSend={onSend} />
    </>
  );
};
