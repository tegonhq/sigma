import { Checkbox } from '@tegonhq/ui';
import { sort } from 'fast-sort';

import type { TaskType } from 'common/types';

import { useUpdateSingleTaskOccurrenceMutation } from 'services/task-occurrence';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface SingleTaskStatusProps {
  task: TaskType;
}

export const SingleTaskStatus = ({ task }: SingleTaskStatusProps) => {
  const { mutate: updateTask } = useUpdateTaskMutation({});
  const { mutate: updateTaskOccurrence } =
    useUpdateSingleTaskOccurrenceMutation({});
  const { taskOccurrencesStore } = useContextStore();
  const taskOccurrences = taskOccurrencesStore.getTaskOccurrencesForTask(
    task.id,
  );

  // Get yesterday's end of day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  // Filter and sort occurrences after yesterday
  const sortedOccurrences = sort(
    taskOccurrences.filter((occ) => new Date(occ.startTime) > yesterday),
  ).by([{ asc: (u) => u.startTime }]);

  const recentTaskOccurrence = sortedOccurrences[0];

  const getStatus = () => {
    if (task && task.recurrence.length > 0 && recentTaskOccurrence) {
      return recentTaskOccurrence?.status;
    }

    return task.status;
  };

  const statusChange = (status: string) => {
    if (task && task.recurrence.length > 0) {
      updateTaskOccurrence({
        taskOccurrenceId: recentTaskOccurrence.id,
        status,
      });
      return;
    }

    updateTask({
      taskId: task.id,
      status,
    });
  };

  return (
    <Checkbox
      className="shrink-0 h-[24px] w-[24px] relative top-[9px] text-xl [&_svg]:w-5 [&_svg]:h-5"
      checked={getStatus() === 'Done'}
      onCheckedChange={(value: boolean) =>
        statusChange(value === true ? 'Done' : 'Todo')
      }
    />
  );
};
