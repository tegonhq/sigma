import { Command, CommandDialog } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

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
