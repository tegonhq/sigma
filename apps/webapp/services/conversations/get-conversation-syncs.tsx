import { getConversationSyncs } from '@sigma/services';
import { type UseQueryResult, useQuery } from 'react-query';

import { type XHRErrorResponse } from 'services/utils';

/**
 * Query Key for Get conversation history.
 */
const GetConversationSyncs = 'getConversationSyncs';

export function useGetConversationSyncsRun(
  conversationId: string,
): UseQueryResult<[], XHRErrorResponse> {
  return useQuery(
    [GetConversationSyncs, conversationId],
    async () => await getConversationSyncs({ conversationId }),
    {
      retry: 1,
      staleTime: 1000000,
      refetchOnWindowFocus: false, // Frequency of Change would be Low
    },
  );
}
