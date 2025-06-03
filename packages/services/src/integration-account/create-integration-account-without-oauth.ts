import { CreateIntegrationAccountDto, IntegrationAccount } from '@sol/types';
import axios from 'axios';

export async function createIntegrationAccountWithoutOAuth(
  createIntegrationAccountDto: Partial<CreateIntegrationAccountDto>,
): Promise<IntegrationAccount> {
  const response = await axios.post(
    `/api/v1/integration_account/create/apikey`,
    createIntegrationAccountDto,
  );

  return response.data;
}
