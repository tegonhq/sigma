import axios from 'axios';
import { type UseQueryResult, useQuery } from 'react-query';

import { type XHRErrorResponse } from 'services/utils';

const getConversationHistoryAction = async (
  conversationHistoryId: string,
  actionId: string,
) => {
  const response = await axios.get(
    `/api/v1/conversation_history/${conversationHistoryId}/action/${actionId}`,
  );

  return response.data;
};

/**
 * Query Key for Get conversation history.
 */
const GetConversationHistoryAction = 'getConversationHistoryAction';

export function useGetConversationHistoryAction(
  conversationHistoryId: string,
  actionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseQueryResult<any, XHRErrorResponse> {
  return useQuery(
    [GetConversationHistoryAction, conversationHistoryId, actionId],
    async () =>
      await getConversationHistoryAction(conversationHistoryId, actionId),
    {
      retry: 1,
      staleTime: 1000000,
      refetchOnWindowFocus: false, // Frequency of Change would be Low
    },
  );
}
