import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { ScheduleDropdown, StatusDropdown } from '../metadata';
import { DuedateDropdown } from '../metadata/due-date';
import { Checkbox, cn } from '@tegonhq/ui';

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
      <div className="p-2 mx-2 flex gap-2 rounded bg-grayAlpha-50 items-center">
        <div className="p-1 bg-grayAlpha-100 rounded flex items-center gap-1 px-2">
          <Checkbox
            className="shrink-0 h-[18px] w-[18px]"
            checked={task.status === 'Done'}
            onCheckedChange={(value: boolean) =>
              statusChange(value === true ? 'Done' : 'Todo')
            }
          />
          {task.status}
        </div>
        <ScheduleDropdown task={task} />
        <DuedateDropdown task={task} />
      </div>
    );
  },
);
