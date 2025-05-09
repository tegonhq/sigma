import { IntegrationDefinition } from '@tegonhq/sigma-sdk';
import axios from 'axios';

export async function integrationCreate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  integrationDefinition: IntegrationDefinition,
) {
  const { oauthResponse } = data;
  const integrationConfiguration = {
    access_token: oauthResponse.authed_user.access_token,
    teamId: oauthResponse.team.id,
    teamName: oauthResponse.team.name,
    userId: oauthResponse.authed_user.id,
    scope: oauthResponse.authed_user.scope,
  };

  const payload = {
    settings: {},
    accountId: integrationConfiguration.userId,
    config: integrationConfiguration,
    integrationDefinitionId: integrationDefinition.id,
  };

  const integrationAccount = (await axios.post(`/api/v1/integration_account`, payload)).data;

  return integrationAccount;
}
