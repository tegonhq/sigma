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

  const { isLoading } = useGetIntegrationDefinitions();
  const ipc = useIPC();

  useHotkeys(
    Key.Escape,
    () => {
      onClose();
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
        <Header />
        <AddTask />

        {/* <div className="mx-4 mt-2">
          <Collapsible className="bg-background-2 p-2 rounded">
            <CollapsibleTrigger className="px-1 flex gap-2 items-center font-mono">
              <CalendarLine size={16} />
              Sync
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              Hi harshith today you will work on some things Hi harshith today
              you will work on some things Hi harshith today you will work on
              some things Hi harshith today you will work on some things Hi
              harshith today you will work on some things Hi harshith today you
              will work on some things
            </CollapsibleContent>
          </Collapsible>
        </div> */}

        <div className="mx-4 mt-2">
          <Tasks />
        </div>

        <div className="grow flex flex-col justify-end overflow-hidden overflow-y-auto">
          <QuickConverstion />
        </div>
      </div>
    </AllProviders>
  );
};
