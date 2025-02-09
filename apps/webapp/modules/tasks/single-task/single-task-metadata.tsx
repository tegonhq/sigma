import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { ListDropdown } from '../list-dropdown';
import { ScheduleDropdown } from '../schedule';
import { StatusDropdown } from '../status-dropdown';

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

    return (
      <div className="p-2 flex gap-2 rounded bg-grayAlpha-50">
        <StatusDropdown value={task.status} onChange={statusChange} />
        <ListDropdown value={task.listId} onChange={listChange} />
        <ScheduleDropdown task={task} />
      </div>
    );
  },
);
