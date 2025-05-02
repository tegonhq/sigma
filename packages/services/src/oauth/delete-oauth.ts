import { IntegrationAccountIdDto } from '@sigma/types';
import axios from 'axios';

export async function deleteIntegrationAccount(
  params: IntegrationAccountIdDto,
) {
  return await axios.delete(
    `/api/v1/integration_account/${params.integrationAccountId}`,
  );
}
