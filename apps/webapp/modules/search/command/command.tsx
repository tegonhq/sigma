import {
  AI,
  CalendarLine,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  IssuesLine,
  TodoLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

interface CommandType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  text: string;
  command: () => void;
}

const defaultCommands: CommandType[] = [
  {
    Icon: AI,
    text: 'Ask sigma agent about...',
    command: () => {},
  },
  {
    Icon: CalendarLine,
    text: 'Go to today',
    command: () => {},
  },
  {
    Icon: CalendarLine,
    text: 'Go to date',
    command: () => {},
  },
];

const defaultTaskCommands: CommandType[] = [
  {
    Icon: CalendarLine,
    text: 'Set due date',
    command: () => {},
  },
  {
    Icon: TodoLine,
    text: 'Set status',
    command: () => {},
  },
];

interface CommandComponentProps {
  onClose?: () => void;
}

export const CommandComponent = observer(
  ({ onClose }: CommandComponentProps) => {
    useScope(SCOPES.Search);
    const [value, setValue] = React.useState('');
    const { tabs, updateTabType } = useApplication();
    const secondTab = tabs[1];
    const { tasksStore, pagesStore } = useContextStore();
    const tasksWithTitle = tasksStore.tasks.map((task) => ({
      ...task,
      title: pagesStore.getPageWithId(task.pageId).title,
    }));

    const constructCommands = () => {
      let commands: CommandType[] = defaultCommands;

      if (
        secondTab.type === TabViewType.MY_TASKS &&
        secondTab.entity_id !== 'my_tasks'
      ) {
        commands = [...commands, ...defaultTaskCommands];
      }

      if (value) {
        commands = commands.filter((command) =>
          command.text.toLowerCase().includes(value.toLowerCase()),
        );
      }

      return commands;
    };

    const tasksSearch = () => {
      if (value) {
        const tasks = tasksWithTitle
          .filter((task) =>
            task.title.toLowerCase().includes(value.toLowerCase()),
          )
          .slice(0, 10);

        if (tasks.length > 0) {
          return (
            <CommandGroup heading="Tasks">
              {tasks.map((task, index: number) => (
                <CommandItem
                  key={index}
                  className="flex gap-2 py-2"
                  onSelect={() => {
                    updateTabType(1, TabViewType.MY_TASKS, task.id);
                    onClose();
                  }}
                >
                  <div className="inline-flex items-center gap-2 min-w-[0px]">
                    <IssuesLine size={16} />
                    <div className="truncate"> {task.title}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        }
      }

      return null;
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

          {constructCommands().map((command: CommandType, index: number) => (
            <CommandItem key={index} className="flex gap-2 py-2">
              <command.Icon size={16} />
              <div>{command.text}</div>
            </CommandItem>
          ))}
          {tasksSearch()}
        </CommandList>
      </>
    );
  },
);
