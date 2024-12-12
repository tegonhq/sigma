import type { IntegrationAccountType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export function useIntegrationAccount(
  integrationDefinitionId: string,
): IntegrationAccountType | undefined {
  const {
    integrationAccountsStore: { integrationAccounts: allIntegrationAccounts },
  } = useContextStore();

  const integrationAccount = allIntegrationAccounts.find(
    (integrationAccount: IntegrationAccountType) => {
      return (
        integrationAccount.integrationDefinitionId === integrationDefinitionId
      );
    },
  );

  return integrationAccount;
}
