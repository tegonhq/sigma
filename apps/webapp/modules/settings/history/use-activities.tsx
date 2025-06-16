import { isToday, isYesterday } from 'date-fns';

import { useContextStore } from 'store/global-context-provider';

export interface ActivityRow {
  type: 'header' | 'row';
  data?: {
    id: string;
    updatedAt: string;
    rowType: 'activity' | 'conversation';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
  };
  title?: string;
}

export const useActivities = () => {
  const { activitiesStore, conversationsStore, conversationHistoryStore } =
    useContextStore();

  const getRows = (): ActivityRow[] => {
    const activities = activitiesStore.getActivities;
    const conversations = conversationsStore.getConversations;

    // Filter activities and create mapped items in one pass
    const activityItems = activities
      .filter(
        (activity) =>
          !conversationHistoryStore.getConversationHistoryForActivity(
            activity.id,
          ),
      )
      .map((item) => ({
        id: item.id,
        updatedAt: item.updatedAt,
        rowType: 'activity' as const,
        item,
      }));

    // Map conversations
    const conversationItems = conversations.map((item) => ({
      id: item.id,
      updatedAt: item.updatedAt,
      rowType: 'conversation' as const,
      item,
    }));

    // Combine and sort
    const allItems = [...activityItems, ...conversationItems]
      .filter((item) => {
        const date = new Date(item.updatedAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= sevenDaysAgo;
      })
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

    // Initialize result array with estimated capacity
    const rows: ActivityRow[] = new Array(allItems.length + 3);
    let rowIndex = 0;

    let currentSection: 'today' | 'yesterday' | 'lastWeek' | null = null;

    // Process items in a single pass
    for (const item of allItems) {
      const date = new Date(item.updatedAt);
      const section = isToday(date)
        ? 'today'
        : isYesterday(date)
          ? 'yesterday'
          : 'lastWeek';

      if (section !== currentSection) {
        currentSection = section;
        rows[rowIndex++] = {
          type: 'header',
          title:
            section === 'today'
              ? 'Today'
              : section === 'yesterday'
                ? 'Yesterday'
                : 'Last Week',
        };
      }

      rows[rowIndex++] = {
        type: 'row',
        data: item,
      };
    }

    return rows.slice(0, rowIndex);
  };

  return {
    rows: getRows(),
  };
};
