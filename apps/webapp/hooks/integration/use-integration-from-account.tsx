import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

export const useIntegrationFromAccount = (integrationAccountId: string) => {
  const { data: integrations, isLoading } = useGetIntegrationDefinitions();
  const { integrationAccountsStore } = useContextStore();
  const integrationAccount =
    integrationAccountsStore.getAccountWithId(integrationAccountId);

  return {
    isLoading,
    integrationAccount,
    integration:
      integrationAccountId && integrations
        ? integrations.find(
            (integration) =>
              integration.id === integrationAccount?.integrationDefinitionId,
          )
        : undefined,
  };
};
