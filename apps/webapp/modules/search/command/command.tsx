import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  IssuesLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useApplication } from 'hooks/application';

import { useContextStore } from 'store/global-context-provider';

import { useSearchCommands } from './use-search-commands';

interface CommandComponentProps {
  onClose?: () => void;
}

export const CommandComponent = observer(
  ({ onClose }: CommandComponentProps) => {
    const { tasksStore, pagesStore } = useContextStore();
    const { selectedTasks, hoverTask } = useApplication();
    const finalSelectedTasks = [...selectedTasks, hoverTask];
    const [value, setValue] = React.useState('');
    const commands = useSearchCommands(value, onClose);
    const task = tasksStore.getTaskWithId(finalSelectedTasks[0]);
    const page = pagesStore.getPageWithId(task?.pageId);

    const defaultCommands = () => {
      const defaultCommands = commands['default'];

      return (
        <>
          {defaultCommands.map((command, index: number) => {
            return (
              <CommandItem
                onSelect={command.command}
                key={`default__${index}`}
                className="flex gap-1 items-center py-2"
              >
                <command.Icon size={16} />
                {command.text}
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
        {page && (
          <div className="max-w-[400px] p-2 pb-0 flex gap-1">
            <div className="flex gap-1 bg-grayAlpha-100 px-2 rounded items-center">
              <IssuesLine size={16} className="shrink-0" />
              <div className="truncate w-fit py-1">{page?.title}</div>
            </div>
          </div>
        )}
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
