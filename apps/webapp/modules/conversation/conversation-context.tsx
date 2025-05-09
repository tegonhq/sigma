import React from 'react';

interface ConversationContextInterface {
  conversationHistoryId: string;
}

export const ConversationContext =
  React.createContext<ConversationContextInterface>(undefined);
