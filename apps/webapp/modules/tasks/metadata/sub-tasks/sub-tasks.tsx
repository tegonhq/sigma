import {
  Badge,
  Checkbox,
  cn,
  Command,
  CommandInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  CommandGroup,
  SubIssue,
  CommandItem,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskViewContext } from 'layouts/side-task-view';

import { useContextStore } from 'store/global-context-provider';

export enum SubTaskVariant {
  DEFAULT = 'DEFAULT',
  SHORT = 'SHORT',
}

interface SubTasksProps {
  taskId: string;
  variant?: SubTaskVariant;
}

export const SubTasks = observer(
  ({ taskId, variant = SubTaskVariant.DEFAULT }: SubTasksProps) => {
    const { tasksStore, pagesStore } = useContextStore();
    const subTasks = tasksStore.getSubTasks(taskId);
    const { openTask } = React.useContext(TaskViewContext);

    if (subTasks.length === 0) {
      return null;
    }

    return (
      <Popover>
        <PopoverTrigger>
          <Badge
            variant="secondary"
            className={cn(
              'flex items-center gap-1',
              variant !== SubTaskVariant.SHORT && 'h-7 px-2 text-sm',
            )}
          >
            <SubIssue size={14} />
            <span className="text-xs">
              {subTasks.filter((task) => task.status === 'Done').length}/
              {subTasks.length}
            </span>
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search sub tasks..." autoFocus />
            <ScrollArea className="max-h-52 overflow-auto">
              <CommandGroup>
                {subTasks.map((task) => {
                  const page = pagesStore.getPageWithId(task?.pageId);
                  return (
                    <CommandItem
                      className="flex gap-1 w-full items-center py-3 h-8"
                      key={task.id}
                      value={page?.title}
                      onSelect={() => {
                        openTask(task.id);
                      }}
                    >
                      <Checkbox
                        className="shrink-0 h-[16px] w-[16px] ml-1"
                        checked={task.status === 'Done'}
                      />
                      <div className="text-muted-foreground font-mono min-w-[40px] pl-1 text-xs self-center">
                        T-{task.number}
                      </div>
                      <div className="inline-flex ml-1 items-center justify-start shrink min-w-[0px] min-h-[24px]">
                        <div
                          className={cn(
                            'text-left truncate',
                            task.status === 'Done' &&
                              'line-through opacity-60 decoration-[1px] decoration-muted-foreground',
                          )}
                        >
                          {page?.title}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
