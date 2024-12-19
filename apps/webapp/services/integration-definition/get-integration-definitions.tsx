import type { IntegrationDefinition } from "@sigma/types";

import { getIntegrationDefinitions } from "@sigma/services";
import { type UseQueryResult, useQuery } from "react-query";

import { type XHRErrorResponse } from "services/utils";

/**
 * Query Key for Get user.
 */
const GetIntegrationDefinitions = "getIntegrationDefinitions";

export function useGetIntegrationDefinitions(): UseQueryResult<
  IntegrationDefinition[],
  XHRErrorResponse
> {
  return useQuery(
    [GetIntegrationDefinitions],
    () => getIntegrationDefinitions(),
    {
      retry: 1,
      staleTime: 100000,
      refetchOnWindowFocus: false, // Frequency of Change would be Low
    }
  );
}
