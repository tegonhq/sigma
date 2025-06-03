import type { IntegrationDefinition } from '@sol/types';

import { Button, Input, useToast } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useCreateIntegrationAccountMutation } from 'services/integration-account/create-integration-account';

import { useIntegrationAccount } from './integration-util';

interface IntegrationAuthAPIProps {
  integrationDefinition: IntegrationDefinition;
}

export const IntegrationAuthAPI = observer(
  ({ integrationDefinition }: IntegrationAuthAPIProps) => {
    const integrationAccount = useIntegrationAccount(integrationDefinition.id);
    const { toast } = useToast();

    const [value, setValue] = React.useState('');
    const { isLoading, mutate: createIntegrationAccount } =
      useCreateIntegrationAccountMutation({});

    const connect = () => {
      if (!value) {
        return;
      }

      createIntegrationAccount(
        {
          integrationDefinitionId: integrationDefinition.id,
          config: {
            apiKey: value,
          },
        },
        {
          onSuccess: () => {
            toast({
              title: 'Integration account connected!',
              description: `${integrationDefinition.name} is connected`,
            });
          },
        },
      );
    };

    return (
      <div className="p-3 border rounded bg-background-3 flex flex-col items-start gap-2">
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

        <div className="flex flex-col w-full">
          <Input
            placeholder="Enter the token"
            className="w-full"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
          <div className="flex justify-end mt-2">
            <Button
              variant="secondary"
              disabled={!value}
              isLoading={isLoading}
              onClick={connect}
            >
              Connect
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
