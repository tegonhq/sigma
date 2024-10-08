import { type UseQueryResult, useQuery } from 'react-query';

import type { User } from 'common/types';

import { getApiURL, type XHRErrorResponse } from 'services/utils';
import axios from 'axios';

/**
 * Query Key for Get user.
 */
export const GetUserQuery = 'getUserQuery';

async function getUser() {
  const response = await axios.get(getApiURL('/v1/users'));

  return response.data;
}

export function useGetUserQuery(): UseQueryResult<User, XHRErrorResponse> {
  return useQuery([GetUserQuery], () => getUser(), {
    retry: 1,
    staleTime: Infinity,
    refetchOnWindowFocus: false, // Frequency of Change would be Low
  });
}
