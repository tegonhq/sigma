import {
  getIntegrationAccountWithToken,
  IntegrationAccountWithToken,
  Task,
  updateTask,
} from '@tegonhq/sigma-sdk';
import axios from 'axios';
import { useMutation } from 'react-query';
import { type UseQueryResult, useQuery } from 'react-query';

interface MutationParamsUpdateTask {
  onMutate?: () => void;
  onSuccess?: (data: Task) => void;
  onError?: (error: string) => void;
}

export function useUpdateTaskMutation({ onMutate, onSuccess, onError }: MutationParamsUpdateTask) {
  const onMutationTriggered = () => {
    onMutate && onMutate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMutationError = (errorResponse: any) => {
    const errorText = errorResponse?.errors?.message || 'Error occured';

    onError && onError(errorText);
  };

  const onMutationSuccess = (data: Task) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(updateTask, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}

/**
 * Query Key for Get user.
 */
export const GetIntegrationAccountToken = 'getIntegrationAccountToken';

export function useGetIntegrationAccount(
  integrationAccountId: string,
): UseQueryResult<IntegrationAccountWithToken, Error> {
  return useQuery(
    [GetIntegrationAccountToken, integrationAccountId],
    () => getIntegrationAccountWithToken({ integrationAccountId }),
    {
      retry: 1,
      staleTime: Infinity,
      refetchOnWindowFocus: false, // Frequency of Change would be Low
    },
  );
}

export async function fetchGitHubIssue(url: string, token: string): Promise<any> {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching data:', error.response?.status, error.response?.data);
      throw new Error(
        `Failed to fetch data from GitHub: ${error.response?.statusText || 'Unknown error'}`,
      );
    } else {
      console.error('Unexpected error:', error);
      throw new Error('Unexpected error occurred');
    }
  }
}

/**
 * Query Key for Get user.
 */
export const GetIssueData = 'getIssueData';

export function useGithubIssueDataQuery(url: string, token: string): UseQueryResult<string, Error> {
  return useQuery([GetIssueData, url], () => fetchGitHubIssue(url, token), {
    retry: 1,
    staleTime: Infinity,
    enabled: false,
    refetchOnWindowFocus: false, // Frequency of Change would be Low
  });
}

export interface GitHubIssueMetadata {
  repoFullName: string;
  type: 'Issue' | 'PR';
  userRole: 'A' | 'R' | 'none';
  status: 'open' | 'closed' | 'merged' | 'draft';
  body?: string;
}

export function parseGitHubIssueData(
  issueData: any,
  settings: any,
): GitHubIssueMetadata | undefined {
  const login = settings?.login;

  if (!issueData) {
    return undefined;
  }

  // Extract repo full name from repository_url
  // repository_url format: "https://api.github.com/repos/owner/repo"
  const repoFullName = issueData.repository_url?.split('/repos/')?.[1] ?? ''; // Get "owner/repo" part

  // Determine if it's an issue or PR by checking for pull_request property
  const type = issueData.pull_request ? 'PR' : 'Issue';

  // Check user role using provided login
  let userRole: 'A' | 'R' | 'none' = 'none';

  // Check if user is assigned
  if (issueData.assignees?.some((assignee: any) => assignee.login === login)) {
    userRole = 'A';
  }
  // For PRs, check if user is requested for review
  else if (
    type === 'PR' &&
    issueData.requested_reviewers?.some((reviewer: any) => reviewer.login === login)
  ) {
    userRole = 'R';
  }

  // Determine status based on type and available data
  let status: 'open' | 'closed' | 'merged' | 'draft';

  if (type === 'PR') {
    if (issueData.draft) {
      status = 'draft';
    } else if (issueData.merged) {
      status = 'merged';
    } else if (issueData.state === 'closed') {
      status = 'closed';
    } else {
      status = 'open';
    }
  } else {
    // For regular issues
    status = issueData.state === 'closed' ? 'closed' : 'open';
  }

  return {
    repoFullName,
    type,
    userRole,
    status,
    body: issueData.body, // A
  };
}
