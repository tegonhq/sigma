import { Command, CommandDialog } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

import { CommandComponent } from './command';

export const Search = () => {
  useScope(SCOPES.Search);
  const ipc = useIPC();

  useHotkeys(
    Key.Escape,
    () => {
      ipc.sendMessage('frontend');
    },
    {
      scopes: [SCOPES.Search],
      enableOnFormTags: true,
    },
  );

  return (
    <Command className="h-[600px] border border-border shadow">
      <CommandComponent />
    </Command>
  );
};

export const SearchDialog = observer(() => {
  useScope(SCOPES.Search);
  const [open, setOpen] = React.useState(false);

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
      onOpenChange={setOpen}
      commandProps={{
        className: 'border-border border w-[600px]',
      }}
    >
      <CommandComponent onClose={() => setOpen(false)} />
    </CommandDialog>
  );
});
