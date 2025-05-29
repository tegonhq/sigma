import { isToday, isYesterday, isThisWeek } from 'date-fns';
import { sort } from 'fast-sort';

import { useContextStore } from 'store/global-context-provider';

interface ConversationRow {
  type: 'header' | 'conversation';
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Replace with proper conversation type
}

export const useConversationRows = (filter?: 'read' | 'unread' | 'all') => {
  const { conversationsStore } = useContextStore();
  const rows: ConversationRow[] = [];

  // Filter conversations based on read status if filter is provided
  let filteredConversations = conversationsStore.conversations;
  if (filter === 'read') {
    filteredConversations = filteredConversations.filter((con) => !con.unread);
  } else if (filter === 'unread') {
    filteredConversations = filteredConversations.filter((con) => con.unread);
  }

  // Sort conversations by date
  const sortedConversations = sort(filteredConversations).desc(
    (con) => con.updatedAt,
  );

  // Group conversations
  const today: typeof sortedConversations = [];
  const yesterday: typeof sortedConversations = [];
  const lastWeek: typeof sortedConversations = [];
  const before: typeof sortedConversations = [];

  sortedConversations.forEach((conversation) => {
    const date = new Date(conversation.updatedAt);
    if (isToday(date)) {
      today.push(conversation);
    } else if (isYesterday(date)) {
      yesterday.push(conversation);
    } else if (isThisWeek(date)) {
      lastWeek.push(conversation);
    } else {
      before.push(conversation);
    }
  });

  // Add grouped conversations to rows with headers
  if (today.length > 0) {
    today.forEach((con) =>
      rows.push({ type: 'conversation', id: con.id, data: con }),
    );
  }

  return rows;
};
