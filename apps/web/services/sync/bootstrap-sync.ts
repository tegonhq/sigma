import { type UseQueryResult, useQuery } from 'react-query';

import type { BootstrapResponse } from 'common/types';

import { getApiURL, type XHRErrorResponse } from 'services/utils';
import axios from 'axios';

/**
 * Query Key for Get bootstrap records.
 */
export const GetBootstrapRecords = 'getBootstrapRecords';

export async function getBootstrapRecords(
  workspaceId: string,
  modelNames: string[],
  userId: string,
) {
  const response = await axios.get(getApiURL(`/v1/sync_actions/bootstrap`), {
    params: {
      workspaceId,
      userId,
      modelNames: modelNames.join(','),
    },
  });

  return response.data;
}

interface QueryParams {
  workspaceId: string;
  userId: string;
  modelNames: string[];
  onSuccess?: (data: BootstrapResponse) => void;
}

export function useBootstrapRecords({
  workspaceId,
  userId,
  modelNames,
  onSuccess,
}: QueryParams): UseQueryResult<BootstrapResponse, XHRErrorResponse> {
  return useQuery(
    [GetBootstrapRecords, modelNames, workspaceId, userId],
    () => getBootstrapRecords(workspaceId, modelNames, userId),
    {
      retry: 1,
      staleTime: 1,
      enabled: false,
      onSuccess,

      refetchOnWindowFocus: false, // Frequency of Change would be Low
    },
  );
}
