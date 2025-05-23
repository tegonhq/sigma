import { useToast } from '@tegonhq/ui';
import React from 'react';

import { ConversationTextarea } from 'modules/conversation/conversation-textarea';

import { useCreateConversationMutation } from 'services/conversations';
import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

export const NewConversation = ({
  startConversation,
}: {
  startConversation: (conversationId: string) => void;
}) => {
  const { commonStore } = useContextStore();
  const { toast } = useToast();

  const { isLoading } = useGetIntegrationDefinitions();
  const user = React.useContext(UserContext);
  const { mutate: createConversation } = useCreateConversationMutation({});

  if (isLoading) {
    return null;
  }

  const onSend = (text: string, agents: string[]) => {
    createConversation(
      {
        message: text,
        context: { agents },
        title: text,
      },
      {
        onSuccess: (data) => {
          commonStore.update({ currentConversationId: data.conversationId });
          startConversation(data.conversationId);
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

  return (
    <div className="flex flex-col h-full justify-center w-full items-start overflow-hidden">
      <div className="flex flex-col w-full items-center">
        <div className="max-w-[90ch] w-full">
          <h1 className="text-[32px] mx-1 font-medium">
            Hello <span className="text-primary">{user.fullname}</span>
          </h1>
          <h1 className="text-[32px] mb-4 mx-1 font-medium text-muted-foreground">
            What can I help with?
          </h1>

          <ConversationTextarea
            className="bg-grayAlpha-100 mt-0 w-full"
            onSend={onSend}
          />
        </div>
      </div>
    </div>
  );
};
