import { Loader } from '@tegonhq/ui';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { QuickConverstion } from 'modules/conversation';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';

import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { AddTask } from './add-task';
import { Header } from './header';
import { Tasks } from './tasks';

export const Quick = () => {
  useScope(SCOPES.QUICK);
  const [conversationId, setConversationId] = React.useState(undefined);
  const { isLoading } = useGetIntegrationDefinitions();
  const ipc = useIPC();

  useHotkeys(
    Key.Escape,
    () => {
      if (conversationId) {
        setConversationId(undefined);
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
      <div className="text-sm flex flex-col justify-start overflow-hidden h-full w-full bg-background quick">
        <Header onClose={onClose} />
        {!conversationId && (
          <>
            <AddTask />

            <div className="mx-4 mt-2">
              <Tasks />
            </div>
          </>
        )}

        <div className="grow flex flex-col justify-end overflow-hidden overflow-y-auto gap-4">
          <QuickConverstion
            conversationId={conversationId}
            setConversationId={setConversationId}
          />
        </div>
      </div>
    </AllProviders>
  );
};
