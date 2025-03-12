import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { ScheduleDropdown, StatusDropdown } from '../metadata';
import { PlanDropdown } from '../metadata/plan';

interface SingleTaskMetadataProps {
  task: TaskType;
}

export const SingleTaskMetadata = observer(
  ({ task }: SingleTaskMetadataProps) => {
    const { mutate: updateTask } = useUpdateTaskMutation({});

    const statusChange = (status: string) => {
      updateTask({
        taskId: task.id,
        status,
      });
    };

    return (
      <div className="p-2 flex gap-2 rounded bg-grayAlpha-50">
        <StatusDropdown value={task.status} onChange={statusChange} />
        <ScheduleDropdown task={task} />
        <PlanDropdown task={task} />
      </div>
    );
  },
);
