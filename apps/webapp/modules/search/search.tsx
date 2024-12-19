import { Command, CommandDialog } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { CommandComponent } from './command';

export const Search = observer(() => {
  return (
    <Command className="h-[600px] border border-border shadow">
      <CommandComponent />
    </Command>
  );
});

export const SearchDialog = observer(() => {
  const [open, setOpen] = React.useState(false);

  useHotkeys(
    [`${Key.Control}+k`, `${Key.Meta}+k`],
    () => {
      setOpen(true);
    },
    {
      scopes: [SCOPES.Global],
    },
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      commandProps={{
        className: 'border-border border w-[600px]',
        shouldFilter: false,
      }}
    >
      <CommandComponent onClose={() => setOpen(false)} />
    </CommandDialog>
  );
});
