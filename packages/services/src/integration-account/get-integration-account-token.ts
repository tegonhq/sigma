import {
  IntegrationAccountIdDto,
  IntegrationAccountWithToken,
} from '@sigma/types';
import axios from 'axios';

export async function getIntegrationAccountWithToken({
  integrationAccountId,
}: IntegrationAccountIdDto): Promise<IntegrationAccountWithToken> {
  const response = await axios.get(
    `/api/v1/integration_account/${integrationAccountId}/token`,
  );

  return response.data;
}
