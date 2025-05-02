import { Command, CommandDialog } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { QuickConverstion } from 'modules/conversation';
import { AddTaskDialogProvider } from 'modules/tasks/add-task';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';

import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

import { CommandComponent, CommandComponentQuick } from './command';

export const Search = () => {
  useScope(SCOPES.Search);
  const ipc = useIPC();
  const [quickConversation, setQuickConversation] = React.useState<{
    conversationHistoryId: string;
    conversationId: string;
  }>(undefined);

  useHotkeys(
    Key.Escape,
    () => {
      onClose();
    },
    {
      scopes: [SCOPES.Search],
      enableOnFormTags: true,
    },
  );

  const onClose = () => {
    setQuickConversation(undefined);

    ipc.sendMessage('quick-window-close');
  };

  return (
    <AllProviders>
      <AddTaskDialogProvider>
        <Command className="border border-border shadow">
          {quickConversation ? (
            <QuickConverstion
              conversationId={quickConversation.conversationId}
              defaultConversationHistoryId={
                quickConversation.conversationHistoryId
              }
            />
          ) : (
            <CommandComponentQuick
              onClose={onClose}
              openConversation={setQuickConversation}
            />
          )}
        </Command>
      </AddTaskDialogProvider>
    </AllProviders>
  );
};

export const SearchDialog = observer(() => {
  useScope(SCOPES.Search);
  const [open, setOpen] = React.useState(false);
  const [quickConversation, setQuickConversation] = React.useState<{
    conversationHistoryId: string;
    conversationId: string;
  }>(undefined);

  useHotkeys(
    [`${Key.Control}+k`, `${Key.Meta}+k`],
    () => {
      setOpen(true);
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setQuickConversation(undefined);
        }

        setOpen(value);
      }}
      commandProps={{
        className: 'border-border border w-[600px]',
      }}
    >
      {quickConversation ? (
        <QuickConverstion
          conversationId={quickConversation.conversationId}
          defaultConversationHistoryId={quickConversation.conversationHistoryId}
        />
      ) : (
        <CommandComponent
          onClose={() => setOpen(false)}
          openConversation={setQuickConversation}
        />
      )}
    </CommandDialog>
  );
});
