import {
  Checkbox,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  IssuesLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { TaskType } from 'common/types';

import { useIPC } from 'hooks/ipc';

import { useUpdateSingleTaskOccurrenceMutation } from 'services/task-occurrence';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface TaskTypeWithOccurrence extends TaskType {
  taskOccurrenceId: string;
}

export const Tasks = observer(() => {
  const { pagesStore, taskOccurrencesStore, tasksStore } = useContextStore();
  const today = new Date();
  const ipc = useIPC();
  const { mutate: updateTask } = useUpdateTaskMutation({});

  const { mutate: updateTaskOccurrence } =
    useUpdateSingleTaskOccurrenceMutation({});
  const getTasksForPage = (pageId: string): TaskTypeWithOccurrence[] => {
    if (pageId) {
      const taskOccurrences =
        taskOccurrencesStore.getTaskOccurrencesForPage(pageId);

      if (!taskOccurrences || taskOccurrences?.length === 0) {
        return [];
      }

      const tasks = taskOccurrences.map((occurrence) => {
        return {
          taskOccurrenceId: occurrence.id,
          ...tasksStore.getTaskWithId(occurrence.taskId),
        };
      });

      return tasks;
    }

    return [];
  };

  // Memoize pages to prevent recalculation
  const page = React.useMemo(
    () => pagesStore.getDailyPageWithDate(today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today],
  );

  const tasks = getTasksForPage(page.id);

  const statusChange = (task: TaskTypeWithOccurrence, status: string) => {
    if (task && task.recurrence.length > 0 && task.taskOccurrenceId) {
      updateTaskOccurrence({
        taskOccurrenceId: task.taskOccurrenceId,
        status,
      });
      return;
    }

    updateTask({
      taskId: task.id,
      status,
    });
  };

  const getStatus = (task: TaskTypeWithOccurrence) => {
    const taskOccurrence = taskOccurrencesStore.getTaskOccurrenceWithTaskAndId(
      task.id,
      task.integrationAccountId,
    );

    if (task && task.recurrence.length > 0 && taskOccurrence) {
      return taskOccurrence?.status;
    }

    return task.status;
  };

  return (
    <Collapsible className="bg-background-2 p-2 rounded">
      <CollapsibleTrigger className="px-1 w-full flex items-center justify-between font-mono">
        <div className="flex gap-2 items-center">
          <IssuesLine size={16} />
          Today tasks
        </div>

        <div className="text-muted-foreground font-mono">{tasks.length}</div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {tasks.map((task, index) => {
          const page = pagesStore.getPageWithId(task?.pageId);

          return (
            <div
              key={index}
              className={cn(
                'flex grow items-start gap-1 ml-1 pr-1 group-hover:bg-grayAlpha-100 rounded-xl shrink min-w-[0px] text-sm',
              )}
            >
              <div
                className="pt-1 shrink-0 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Checkbox
                  className="shrink-0 relative top-[5px] h-[16px] w-[16px]"
                  checked={getStatus(task) === 'Done'}
                  onCheckedChange={(value: boolean) =>
                    statusChange(task, value === true ? 'Done' : 'Todo')
                  }
                />
              </div>

              <div
                className={cn(
                  'flex flex-col w-full py-1 border-b border-border shrink min-w-[0px]',
                )}
              >
                <div className="flex w-full justify-between gap-4 items-center">
                  <div className="flex gap-2 w-full items-center min-w-[0px] shrink">
                    <div
                      className="text-muted-foreground font-mono min-w-[40px] pl-1 relative top-[1px] text-xs self-center shrink-0"
                      onClick={() => {
                        ipc.sendToMain({ type: 'Task', id: task.id });
                      }}
                    >
                      T-{task.number}
                    </div>
                    <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                      <div
                        className={cn(
                          'text-left truncate',
                          getStatus(task) === 'Done' &&
                            'line-through opacity-60 decoration-[1px] decoration-muted-foreground',
                        )}
                      >
                        {page?.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pr-1 shrink-0"></div>
                </div>
              </div>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
});
