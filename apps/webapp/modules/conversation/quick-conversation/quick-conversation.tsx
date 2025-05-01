import { UserTypeEnum } from '@sigma/types';
import React from 'react';

import { ScrollAreaWithAutoScroll } from 'common/use-auto-scroll';

import {
  useCreateConversationHistoryMutation,
  useStreamConversationMutation,
} from 'services/conversations';

import { UserContext } from 'store/user-context';

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

  const {
    mutate: streamConversation,
    isLoading,
    thoughts,
    responses,
  } = useStreamConversationMutation();
  const { mutate: createConversationHistory } =
    useCreateConversationHistoryMutation({});
  console.log(isLoading, thoughts);

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

  return (
    <ScrollAreaWithAutoScroll className="h-full">
      {isLoading && (
        <StreamingConversation messages={responses} thoughts={thoughts} />
      )}
      <ConversationTextarea onSend={onSend} />
    </ScrollAreaWithAutoScroll>
  );
};
