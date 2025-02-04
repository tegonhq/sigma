import {
  IntegrationAccount,
  IntegrationAccountIdDto,
  UpdateIntegrationAccountDto,
} from '@sigma/types';
import axios from 'axios';

export async function updateIntegrationAccount(
  { integrationAccountId }: IntegrationAccountIdDto,
  integrationAccountDto: UpdateIntegrationAccountDto,
): Promise<IntegrationAccount> {
  const response = await axios.post(
    `/api/v1/integration_account/${integrationAccountId}`,
    integrationAccountDto,
  );

  return response.data;
}
