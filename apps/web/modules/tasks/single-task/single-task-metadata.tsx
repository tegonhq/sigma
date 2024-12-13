import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { StatusDropdown } from '../status-dropdown';
import { DueDate } from './due-date';

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

    const dueDateChange = (dueDate: Date) => {
      updateTask({
        taskId: task.id,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      });
    };

    return (
      <div className="bg-grayAlpha-100 p-3 flex gap-2 rounded">
        <StatusDropdown value={task.status} onChange={statusChange} />

        <DueDate dueDate={task.dueDate} dueDateChange={dueDateChange} />
      </div>
    );
  },
);
