import axios from 'axios';

import { getGithubData } from './utils';

export async function integrationCreate(
  userId: string,
  workspaceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) {
  const { oauthResponse, integrationDefinition } = data;
  const integrationConfiguration = {
    refresh_token: oauthResponse.refresh_token,
    access_token: oauthResponse.access_token,
  };

  const user = await getGithubData(
    'https://api.github.com/user',
    integrationConfiguration.access_token,
  );
  const allRepos = await getGithubData(
    'https://api.github.com/user/repos',
    integrationConfiguration.access_token,
  );

  const repositories = allRepos.map((repo: any) => ({
    id: repo.id.toString(),
    name: repo.name,
    private: repo.private,
    fullName: repo.full_name,
  }));

  const payload = {
    settings: {
      login: user.login,
      schedule: {
        frequency: '*/5 * * * *',
      },
      repositories,
    },
    userId,
    accountId: user.id.toString(),
    config: integrationConfiguration,
    workspaceId,
    integrationDefinitionId: integrationDefinition.id,
  };

  const integrationAccount = (await axios.post(`/api/v1/integration_account`, payload)).data;

  return integrationAccount;
}
