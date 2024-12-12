import { IntegrationDefinition } from '@sigma/types';
import axios from 'axios';

export async function getIntegrationDefinitions(): Promise<
  IntegrationDefinition[]
> {
  const response = await axios.get(`/api/v1/integration_definition`);

  return response.data;
}
