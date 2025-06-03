import { CommandDialog } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useScope } from 'hooks/use-scope';

import { CommandComponent } from './command';

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
        className: 'border-none w-[600px]',
        loop: true,
      }}
    >
      <CommandComponent onClose={() => setOpen(false)} />
    </CommandDialog>
  );
});
