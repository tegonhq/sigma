import { Dot } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

interface TaskTypeWithOccurrence extends TaskType {
  taskOccurrenceId: string;
}

export const Footer = observer(() => {
  const today = new Date();

  const user = React.useContext(UserContext);
  const { pagesStore, taskOccurrencesStore, tasksStore } = useContextStore();

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

  const getCompleted = (tasks: TaskTypeWithOccurrence[]) => {
    return tasks.filter((task) => task.status === 'Done');
  };

  return (
    <div className="h-8 border-t border-border flex gap-2 items-center px-4 font-mono text-muted-foreground text-xs">
      <div>Hi {user?.fullname}</div>

      <Dot size={10} />

      <div>Today tasks: {tasks.length}</div>

      <Dot size={10} />
      <div>Completed tasks: {getCompleted(tasks).length}</div>
    </div>
  );
});
