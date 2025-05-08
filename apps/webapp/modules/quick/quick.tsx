import { Command, Loader } from '@tegonhq/ui';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';

import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { CommandComponent } from './command';

export const Quick = () => {
  useScope(SCOPES.QUICK);
  const [conversationId, setConversationId] = React.useState(undefined);
  const [AI, setAI] = React.useState(false);

  const { isLoading } = useGetIntegrationDefinitions();
  const ipc = useIPC();

  useHotkeys(
    Key.Escape,
    () => {
      if (conversationId) {
        setConversationId(undefined);
        setAI(false);
      } else {
        onClose();
      }
    },
    {
      scopes: [SCOPES.QUICK],
    },
  );

  const onClose = () => {
    ipc.sendMessage('quick-window-close');
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AllProviders>
      <Command className="quick bg-background-2 backdrop-blur-[4px]">
        <CommandComponent
          onClose={onClose}
          conversationId={conversationId}
          setConversationId={setConversationId}
          AI={AI}
          setAI={setAI}
        />
      </Command>
    </AllProviders>
  );
};
