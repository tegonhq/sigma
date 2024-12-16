import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { StatusDropdown } from '../status-dropdown';
import { DueDate } from './due-date';
import { Separator } from '@tegonhq/ui';

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
      <div className="py-3 flex flex-col gap-2 rounded">
        <div className="flex gap-2 items-center justify-start">
          <div className="label min-w-[100px]">Status</div>
          <StatusDropdown value={task.status} onChange={statusChange} />
        </div>

        <div className="flex gap-2 items-center">
          <div className="label min-w-[100px]">Due date</div>
          <DueDate dueDate={task.dueDate} dueDateChange={dueDateChange} />
        </div>
      </div>
    );
  },
);
