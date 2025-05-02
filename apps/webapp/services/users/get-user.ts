import axios from 'axios';
import { type UseQueryResult, useQuery } from 'react-query';

import type { User } from 'common/types';

import { type XHRErrorResponse } from 'services/utils';

/**
 * Query Key for Get user.
 */
export const GetUserQuery = 'getUserQuery';

async function getUser() {
  const response = await axios.get('/api/v1/users');

  return response.data;
}

export function useGetUserQuery(): UseQueryResult<User, XHRErrorResponse> {
  return useQuery([GetUserQuery], () => getUser(), {
    retry: 1,
    staleTime: Infinity,
    refetchOnWindowFocus: false, // Frequency of Change would be Low
  });
}
