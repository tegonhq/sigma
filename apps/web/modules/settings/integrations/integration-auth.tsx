import type { IntegrationDefinition } from '@sigma/types';

import { Button } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useIPC } from 'hooks/ipc';

import {
  useCreateRedirectURLMutation,
  useDeleteIntegrationAccount,
} from 'services/oauth';

import { useIntegrationAccount } from './integration-util';

interface IntegrationAuthProps {
  integrationDefinition: IntegrationDefinition;
}

export const IntegrationAuth = observer(
  ({ integrationDefinition }: IntegrationAuthProps) => {
    const integrationAccount = useIntegrationAccount(integrationDefinition.id);
    const ipc = useIPC();

    const { mutate: createRedirectURL, isLoading: redirectURLLoading } =
      useCreateRedirectURLMutation({
        onSuccess: (data) => {
          const redirectURL = data.redirectURL;
          ipc.openUrl(redirectURL);
        },
      });

    const { mutate: deleteIntegrationAccount, isLoading: deleting } =
      useDeleteIntegrationAccount({});

    return (
      <div className="p-3 border rounded bg-background-3 flex items-center justify-between">
        <div className="flex flex-col items-start justify-center">
          {integrationAccount ? (
            <>
              <p className="font-medium">Connected your account</p>
              <p className="text-muted-foreground">
                Your
                <span className="mx-1 font-medium">
                  {integrationDefinition.name}
                </span>
                account is connected
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Connect your account</p>
              <p className="text-muted-foreground">
                Connect your {integrationDefinition.name} account to use the
                integration
              </p>
            </>
          )}
        </div>

        <div>
          {integrationAccount ? (
            <Button
              variant="destructive"
              onClick={() => {
                deleteIntegrationAccount({
                  integrationAccountId: integrationAccount.id,
                });
              }}
              isLoading={deleting}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                createRedirectURL({
                  redirectURL: window.location.href,
                  integrationDefinitionId: integrationDefinition.id,
                });
              }}
              isLoading={redirectURLLoading}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    );
  },
);
