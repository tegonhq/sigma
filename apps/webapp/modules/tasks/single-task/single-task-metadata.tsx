import { Checkbox } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateSingleTaskOccurrenceMutation } from 'services/task-occurrence';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { ScheduleDropdown } from '../metadata';
import { DuedateDropdown } from '../metadata/due-date';

interface SingleTaskMetadataProps {
  task: TaskType;
}

export const SingleTaskMetadata = observer(
  ({ task }: SingleTaskMetadataProps) => {
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

    const getStatus = () => {
      if (task && task.recurrence.length > 0) {
        return recentTaskOccurrence.status;
      }

      return task.status;
    };

    return (
      <div className="p-2 mx-2 flex gap-2 rounded bg-grayAlpha-50 items-center">
        <div className="p-1 bg-grayAlpha-100 rounded flex items-center gap-1 px-2">
          <Checkbox
            className="shrink-0 h-[18px] w-[18px]"
            checked={getStatus() === 'Done'}
            onCheckedChange={(value: boolean) =>
              statusChange(value === true ? 'Done' : 'Todo')
            }
          />
          {getStatus()}
        </div>
        <ScheduleDropdown task={task} />
        <DuedateDropdown task={task} />
      </div>
    );
  },
);
