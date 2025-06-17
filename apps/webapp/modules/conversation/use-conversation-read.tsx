import React from 'react';

import { useReadConversationtMutation } from 'services/conversations';

import { useContextStore } from 'store/global-context-provider';

export const useConversationRead = (conversationId: string) => {
  const { conversationsStore } = useContextStore();
  const conversation = conversationsStore.getConversationWithId(conversationId);
  const { mutate: readConversation } = useReadConversationtMutation({});

  React.useEffect(() => {
    if (conversation?.unread) {
      readConversation(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.unread]);
};
