import {
  Checkbox,
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@tegonhq/ui';
import { isAfter, isBefore, startOfDay, isToday } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';

import {
  getStatusColor,
  getStatusIcon,
} from 'modules/tasks/status-dropdown/status-utils';

import { useCreateTaskMutation, useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface AddTaskProps {
  onClose: () => void;
  date: Date;
}

export const AddTask = observer(({ onClose, date }: AddTaskProps) => {
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef(null);

  const { tasksStore, pagesStore } = useContextStore();
  const tasks = isToday(date)
    ? tasksStore.getTasksNotToday()
    : tasksStore.getTasksNotCompleted();

  const tasksWithTitle = tasks.map((task) => ({
    ...task,
    title: pagesStore.getPageWithId(task.pageId).title,
  }));

  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: () => {},
  });

  const { mutate: updateTaskMutation } = useUpdateTaskMutation({
    onSuccess: () => {},
  });

  const filteredTasks = tasksWithTitle
    .filter((task) => task.title.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 10); // Limit to 10 results;

  const onBlur = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
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
    onClose();
  };

  const updateTask = (taskId: string) => {
    const { status, dueDate } = getTaskStatus(date);

    updateTaskMutation({
      taskId,
      status,
      dueDate,
    });
    onClose();
  };

  return (
    <Command className="w-full text-base bg-transparent" shouldFilter={false}>
      <div className="flex gap-1 items-start">
        <Checkbox className="mt-[2px]" checked={false} />
        <div className="text-muted-foreground font-mono min-w-[40px] pl-1 text-sm mt-[1px]">
          P-{tasksStore.getLastTaskNumber() + 1}
        </div>

        <CommandInput
          placeholder="Search task..."
          value={value}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoFocus
          id="searchTask"
          containerClassName="border-none px-0 rounded-none bg-transparent w-full"
          className="py-0 px-0 h-5 rounded-none w-full"
          onValueChange={setValue}
        />
      </div>

      <CommandList className="flex-1 bg-popover w-fit">
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
              <div className="flex gap-1 items-center">
                <CategoryIcon
                  size={16}
                  color={getStatusColor(task.status).color}
                  className="shrink-0"
                />
                {page?.title}
              </div>
            </CommandItem>
          );
        })}
        {filteredTasks.length === 0 && (
          <CommandItem
            key="new"
            className="max-w-[700px]"
            onClick={addTask}
            onSelect={addTask}
          >
            Create task: {value}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  );
});
