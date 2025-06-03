import { IntegrationDefinition } from '@redplanethq/sol-sdk';
import axios from 'axios';

export async function integrationCreate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  integrationDefinition: IntegrationDefinition,
) {
  const { oauthResponse, oauthParams } = data;
  const integrationConfiguration = {
    refresh_token: oauthResponse.refresh_token,
    redirect_uri: oauthParams.redirect_uri,
  };

  const access_token = oauthResponse.access_token;

  // Fetch Gmail user details using the access token
  const userResponse = await axios.get('https://www.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  // Extract user information
  const userEmail = userResponse.data.emailAddress;

  const payload = {
    settings: {},
    accountId: userEmail,
    config: integrationConfiguration,
    integrationDefinitionId: integrationDefinition.id,
  };

  const integrationAccount = (await axios.post(`/api/v1/integration_account`, payload)).data;

  return integrationAccount;
}
