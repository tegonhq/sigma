'use client';

import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { FRONTEND_IPC, SCOPES } from 'common/shortcut-scopes';

import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

export const CommandComponent = observer(() => {
  useScope(SCOPES.Search);
  const [value, setValue] = React.useState('');
  const ipcRenderer = useIPC();

  useHotkeys(
    [Key.Escape],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => {
      ipcRenderer.sendMessage(FRONTEND_IPC);
    },
    {
      scopes: [SCOPES.Search],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <Command className="h-[600px] border border-border shadow">
      <CommandInput
        placeholder="Ask AI anything..."
        value={value}
        autoFocus
        className="h-10"
        onValueChange={(value: string) => setValue(value)}
      />
      <CommandList className="p-2 flex-1 max-h-[100%]">
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </Command>
  );
});
