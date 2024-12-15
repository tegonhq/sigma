import axios from 'axios';

export interface CreateRedirectURLParams {
  integrationDefinitionId: string;
  redirectURL: string;
}

export interface RedirectURLResponse {
  status: number;
  redirectURL: string;
}

export async function createRedirectURL(
  params: CreateRedirectURLParams,
): Promise<RedirectURLResponse> {
  const response = await axios.post('/api/v1/oauth', params);

  return response.data;
}
