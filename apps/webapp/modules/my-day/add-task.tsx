import {
  AddLine,
  Button,
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Shortcut,
} from '@tegonhq/ui';
import { isAfter, isBefore, startOfDay, isToday } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import {
  getStatusColor,
  getStatusIcon,
} from 'modules/tasks/status-dropdown/status-utils';

import { SCOPES } from 'common/shortcut-scopes';
import { TooltipWrapper } from 'common/tooltip/tooltip-wrapper';

import { useCreateTaskMutation, useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface AddTaskProps {
  date: Date;
}

export const AddTask = observer(({ date }: AddTaskProps) => {
  const [value, setValue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef(null);

  const { tasksStore, pagesStore } = useContextStore();
  const tasks = isToday(date)
    ? tasksStore.getTasksNotToday()
    : tasksStore.getTasksNotCompleted();

  const tasksWithTitle = tasks.map((task) => ({
    ...task,
    title: pagesStore.getPageWithId(task.pageId)?.title,
  }));

  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: () => {},
  });

  const { mutate: updateTaskMutation } = useUpdateTaskMutation({
    onSuccess: () => {},
  });

  const filteredTasks = tasksWithTitle
    .filter(
      (task) =>
        task.title?.toLowerCase().includes(value.toLowerCase()) ||
        task.number.toString().toLowerCase().includes(value.toLowerCase()),
    )
    .slice(0, 10); // Limit to 10 results;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const getTaskStatus = (taskDate: Date) => {
    const today = startOfDay(new Date());
    const normalizedTaskDate = startOfDay(taskDate);

    if (isBefore(normalizedTaskDate, today)) {
      return { status: 'Done', dueDate: undefined };
    } else if (isAfter(normalizedTaskDate, today)) {
      return { status: 'Todo', dueDate: taskDate.toISOString() };
    }

    return { status: 'In Progress', dueDate: undefined };
  };

  const addTask = () => {
    const { status, dueDate } = getTaskStatus(date);
    addTaskMutation({
      title: value,
      status,
      dueDate,
    });
    setValue('');
    setOpen(false);
  };

  const updateTask = (taskId: string) => {
    const { status, dueDate } = getTaskStatus(date);
    updateTaskMutation({
      taskId,
      status,
      dueDate,
    });
    setValue('');
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex gap-1 w-fit px-0 -ml-2 px-2">
            <TooltipWrapper
              tooltip={<Shortcut shortcut="n" isMeta />}
              className="flex items-center gap-1"
            >
              <AddLine size={14} />
              Add new task
            </TooltipWrapper>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command className="w-full text-base" shouldFilter={false}>
            <CommandInput
              placeholder="Add/create task"
              value={value}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              autoFocus
              id="searchTask"
              onValueChange={setValue}
            />

            <ScrollArea className="h-48 overflow-auto">
              <CommandList className="flex-1 w-full mt-1 px-1">
                {filteredTasks.map((task) => {
                  const page = pagesStore.getPageWithId(task?.pageId);
                  const CategoryIcon = getStatusIcon(task.status);

                  return (
                    <CommandItem
                      key={task.id}
                      className="max-w-[300px]"
                      onSelect={() => {
                        updateTask(task.id);
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <CategoryIcon
                          size={16}
                          color={getStatusColor(task.status).color}
                          className="shrink-0"
                        />
                        <div className="shrink-0 w-[35px] text-sm">
                          T-{task.number}
                        </div>
                        <div className="w-[200px]">
                          <div className="truncate"> {page?.title}</div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
                {filteredTasks.length === 0 && (
                  <CommandItem
                    key="new"
                    className="max-w-[300px]"
                    onClick={addTask}
                    onSelect={addTask}
                  >
                    Create task: {value}
                  </CommandItem>
                )}
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
});
