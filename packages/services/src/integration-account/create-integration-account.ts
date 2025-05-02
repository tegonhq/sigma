import { CreateIntegrationAccountDto, IntegrationAccount } from '@sigma/types';
import axios from 'axios';

export async function createIntegrationAccount(
  createIntegrationAccountDto: CreateIntegrationAccountDto,
): Promise<IntegrationAccount> {
  const response = await axios.post(
    `/api/v1/integration_account`,
    createIntegrationAccountDto,
  );

  return response.data;
}
