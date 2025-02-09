import { Checkbox, cn } from '@tegonhq/ui';
import { isAfter, isBefore } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { TaskInfo } from 'modules/tasks/task-info';

import type { TaskType } from 'common/types';
import { TaskViewContext } from 'layouts/side-task-view';

import { useUpdatePageMutation } from 'services/pages';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface TasksProps {
  date: Date;
  tasks: TaskType[];
}

export const Tasks = observer(({ date, tasks }: TasksProps) => {
  const { pagesStore } = useContextStore();
  const { openTask } = React.useContext(TaskViewContext);

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
        dueDate: isAfter(date, new Date()) ? null : undefined,
      });
    }
  };

  const handleCheckBox = (checked: boolean, taskId: string) => {
    updateTaskMutation({
      taskId,
      status: checked ? 'Done' : 'In Progress',
    });
  };

  const getTasksPlaceholder = () => {
    if (isAfter(date, new Date())) {
      return 'No tasks due. Add new tasks (Cmd + n)';
    }

    if (isBefore(date, new Date())) {
      return 'No tasks finished on this day';
    }

    return 'Move tasks into In Progress to see here';
  };

  return (
    <div className="flex flex-col gap-2 bg-grayAlpha-50 p-3 rounded mb-2">
      {tasks.length > 0 ? (
        <div className="flex flex-col gap-2">
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
                    if (
                      refs.current[index] &&
                      !refs.current[index].textContent
                    ) {
                      refs.current[index].textContent = page?.title;
                    }
                  }} // Assign ref for focusing
                  contentEditable
                  suppressContentEditableWarning
                  className={cn(
                    'w-fit z-10 relative resize-none overflow-hidden whitespace-pre-wrap break-words focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                    isCompleted && 'line-through',
                  )}
                  onInput={(e) => handleInput(e, page.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)} // Handle Enter key
                />
                <TaskInfo task={task} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-muted-foreground">{getTasksPlaceholder()}</div>
      )}
    </div>
  );
});
