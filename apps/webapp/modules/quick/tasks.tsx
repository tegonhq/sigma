import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskListItem } from 'modules/tasks/task-item';

import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';
import { Checkbox, cn } from '@tegonhq/ui';

interface TaskTypeWithOccurrence extends TaskType {
  taskOccurrenceId: string;
}

export const Tasks = observer(() => {
  const { pagesStore, taskOccurrencesStore, tasksStore } = useContextStore();
  const today = new Date();

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

  return (
    <>
      {tasks.map((task, index) => {
        const page = pagesStore.getPageWithId(task?.pageId);

        return (
          <div
            key={index}
            className={cn(
              'flex grow items-start gap-2 ml-1 pr-2 group-hover:bg-grayAlpha-100 rounded-xl shrink min-w-[0px] text-sm',
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
                checked={false}
                onCheckedChange={(value: boolean) => console.log(value)}
              />
            </div>

            <div
              className={cn(
                'flex flex-col w-full py-1 border-b border-border shrink min-w-[0px]',
              )}
            >
              <div className="flex w-full justify-between gap-4 items-center">
                <div className="flex gap-2 w-full items-center min-w-[0px] shrink">
                  <div className="text-muted-foreground font-mono min-w-[40px] pl-1 relative top-[1px] text-xs self-center shrink-0">
                    T-{task.number}
                  </div>
                  <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                    <div
                      className={cn(
                        'text-left truncate',
                        false &&
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
    </>
  );
});
