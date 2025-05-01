import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useSearchCommandsQuick } from './use-search-commands';

interface CommandComponentProps {
  onClose?: () => void;
}

export const CommandComponentQuick = observer(
  ({ onClose }: CommandComponentProps) => {
    const [value, setValue] = React.useState('');
    const commands = useSearchCommandsQuick(value, onClose);

    const defaultCommands = () => {
      const defaultCommands = commands['default'];

      return (
        <>
          {defaultCommands.map((command, index: number) => {
            return (
              <CommandItem
                onSelect={command.command}
                key={`default__${index}`}
                className="flex gap-2 items-center py-2"
              >
                <command.Icon size={16} />
                <div className="grow">{command.text}</div>
              </CommandItem>
            );
          })}
        </>
      );
    };

    const pagesCommands = () => {
      const pagesCommands = commands['Pages'];

      if (!pagesCommands) {
        return null;
      }

      return (
        <CommandGroup heading="Pages">
          {pagesCommands.map((command, index: number) => {
            return (
              <CommandItem
                onSelect={command.command}
                key={`page__${index}`}
                className="flex gap-1 items-center py-2"
              >
                <div className="inline-flex items-center gap-2 min-w-[0px]">
                  <command.Icon size={16} className="shrink-0" />
                  <div className="truncate"> {command.text}</div>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      );
    };

    return (
      <>
        <CommandInput
          placeholder="Search/Ask anything..."
          className="rounded-md h-10"
          value={value}
          autoFocus
          onValueChange={(value: string) => setValue(value)}
        />
        <CommandList className="p-2 flex-1 max-h-[100%]">
          <CommandEmpty>No results found.</CommandEmpty>
          {defaultCommands()}
          {pagesCommands()}
        </CommandList>
      </>
    );
  },
);
