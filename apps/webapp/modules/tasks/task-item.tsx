import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { IntegrationTaskItem } from './integration-task-item';
import { StatusDropdown, StatusDropdownVariant } from './status-dropdown';
import { TaskDueDate } from './task-duedate';

interface TaskListItemProps {
  taskId: string;
}

export const TaskListItem = observer(({ taskId }: TaskListItemProps) => {
  const { tasksStore, pagesStore } = useContextStore();

  const task = tasksStore.getTaskWithId(taskId);
  const page = pagesStore.getPageWithId(task.pageId);
  const { mutate: updateTask } = useUpdateTaskMutation({});

  const statusChange = (status: string) => {
    updateTask({
      taskId: task.id,
      status,
    });
  };

  if (task.integrationAccountId) {
    return (
      <IntegrationTaskItem
        task={task}
        page={page}
        statusChange={statusChange}
      />
    );
  }

  return (
    <div className="pl-1 flex group cursor-default gap-2">
      <div className="w-full flex items-center">
        <div
          className={cn(
            'flex w-full items-start gap-2 pl-2 ml-1 pr-2 group-hover:bg-grayAlpha-100 rounded-xl shrink min-w-[0px]',
          )}
        >
          <div className="pt-2 shrink-0">
            <StatusDropdown
              value={task.status}
              onChange={statusChange}
              variant={StatusDropdownVariant.NO_BACKGROUND}
            />
          </div>

          <div
            className={cn(
              'flex flex-col w-full py-2 border-b border-border shrink min-w-[0px]',
            )}
          >
            <div className="flex w-full justify-between gap-4">
              <div className="flex gap-1 w-full">
                <div className="text-muted-foreground font-mono min-w-[40px] pl-1 text-sm self-center">
                  T-{task.number}
                </div>
                <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                  <div className="text-left truncate">{page?.title}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pr-1 shrink-0">
                {task.status !== 'Done' && (
                  <TaskDueDate dueDate={task.dueDate} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
