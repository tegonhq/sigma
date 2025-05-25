/* eslint-disable @typescript-eslint/no-explicit-any */
import { IntegrationDefinitionV2 } from '@prisma/client';

import { getIntegrationConfigForIntegrationDefinition } from '../utils/utils';

export const getIntegrationAccountConfig = async (
  agent: string,
  integrationDefinitions: IntegrationDefinitionV2[],
  token: string,
) => {
  if (agent === 'sigma') {
    return { accessToken: token };
  }

  const integrationDefinition = integrationDefinitions.find(
    (id) => id.slug === agent,
  );

  if (!integrationDefinition) {
    throw new Error(
      `Integration Definition is not found for the agent: ${agent}`,
    );
  }

  const integrationAccount = await getIntegrationConfigForIntegrationDefinition(
    integrationDefinition.id,
  );

  return integrationAccount?.integrationConfiguration;
};
