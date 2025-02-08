import { Checkbox, cn } from '@tegonhq/ui';
import { isAfter, isBefore, isToday } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useUpdatePageMutation } from 'services/pages';
import { useUpdateTaskMutation } from 'services/tasks';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

interface TasksProps {
  date: Date;
  tasks: TaskType[];
}

function getTitle(date: Date) {
  const today = new Date();

  if (isToday(date)) {
    return 'Today tasks';
  } else if (isBefore(date, today)) {
    return 'Completed tasks';
  }

  return 'Upcoming tasks';
}

export const Tasks = observer(({ date, tasks }: TasksProps) => {
  const { pagesStore } = useContextStore();
  const { updateTabType } = useApplication();

  const refs = React.useRef([]);

  const { mutate: updateTaskMutation } = useUpdateTaskMutation({
    onSuccess: () => {},
  });
  const { mutate: updatePageMutation } = useUpdatePageMutation({
    onSuccess: () => {},
  });

  const debouncedUpdates = useDebouncedCallback(
    async (title: string, pageId: string) => {
      updatePageMutation({
        pageId,
        title,
      });
    },
    500,
  );

  const handleInput = (e: React.FormEvent<HTMLDivElement>, pageId: string) => {
    debouncedUpdates(e.currentTarget.textContent, pageId);
  };

  // Handle key down for Enter key
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      refs.current[index + 1]?.focus();
    }

    // Handle up arrow key
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();

      refs.current[index - 1]?.focus();
    }

    // Handle down arrow key
    if (e.key === 'ArrowDown' && index < refs.current.length - 1) {
      e.preventDefault();

      refs.current[index + 1]?.focus();
    }

    if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();

      updateTaskMutation({
        taskId: tasks[index].id,
        status: 'Todo',
        startTime: isAfter(date, new Date()) ? null : undefined,
      });
    }
  };

  const handleCheckBox = (checked: boolean, taskId: string) => {
    updateTaskMutation({
      taskId,
      status: checked ? 'Done' : 'In Progress',
    });
  };

  const openTask = (taskId: string) => {
    updateTabType(0, TabViewType.MY_TASKS, { entityId: taskId });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <h3 className="text-muted-foreground font-medium">{getTitle(date)}</h3>
      </div>

      <div className="flex flex-col gap-2 mb-10">
        {tasks.map((task, index: number) => {
          const page = pagesStore.getPageWithId(task?.pageId);
          const isCompleted =
            task.status === 'Done' || task.status === 'Canceled';

          return (
            <div className="flex gap-1 items-start" key={task.id}>
              <Checkbox
                className="mt-[2px]"
                checked={isCompleted}
                onCheckedChange={(checked: boolean) =>
                  handleCheckBox(checked, task.id)
                }
              />
              <div
                className="text-muted-foreground font-mono min-w-[40px] pl-1 text-sm mt-[1px] cursor-pointer"
                onClick={() => {
                  openTask(task.id);
                }}
              >
                T-{task.number}
              </div>
              <div
                ref={(el) => {
                  refs.current[index] = el;
                  if (refs.current[index] && !refs.current[index].textContent) {
                    refs.current[index].textContent = page?.title;
                  }
                }} // Assign ref for focusing
                contentEditable
                suppressContentEditableWarning
                className={cn(
                  'w-full z-10 relative resize-none overflow-hidden whitespace-pre-wrap break-words focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                  isCompleted && 'line-through',
                )}
                onInput={(e) => handleInput(e, page.id)}
                onKeyDown={(e) => handleKeyDown(e, index)} // Handle Enter key
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
