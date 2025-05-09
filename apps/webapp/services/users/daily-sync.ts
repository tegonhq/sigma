import axios from 'axios';
import { type UseQueryResult, useQuery } from 'react-query';

import { type XHRErrorResponse } from 'services/utils';

const getDailySync = async (date: string) => {
  const response = await axios.get(`/api/v1/users/sync/${date}`);

  return response.data;
};

/**
 * Query Key for Get conversation history.
 */
const GetDailySync = 'getDailySync';

export function useGetDailySync(
  date: string,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseQueryResult<any, XHRErrorResponse> {
  return useQuery([GetDailySync, date], async () => await getDailySync(date), {
    retry: 1,
    staleTime: 1000000,
    refetchOnWindowFocus: false, // Frequency of Change would be Low
  });
}
