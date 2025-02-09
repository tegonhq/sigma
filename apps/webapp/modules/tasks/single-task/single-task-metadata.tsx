import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { StatusDropdown } from '../status-dropdown';
import { DueDate } from './due-date';
import { ListDropdown } from '../list-dropdown';
import { ScheduleDropdown } from '../schedule-dropdown';

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

    const listChange = (listId: string) => {
      updateTask({
        taskId: task.id,
        listId,
      });
    };

    const dueDateChange = (dueDate: Date) => {
      updateTask({
        taskId: task.id,
        startTime: dueDate ? dueDate.toISOString() : undefined,
      });
    };

    console.log(task);
    return (
      <div className="p-2 flex gap-2 rounded bg-grayAlpha-50">
        <StatusDropdown value={task.status} onChange={statusChange} />
        <ListDropdown value={task.listId} onChange={listChange} />
        <ScheduleDropdown task={task} />
      </div>
    );
  },
);
