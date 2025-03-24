import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { ScheduleDropdown } from '../metadata';
import { DuedateDropdown } from '../metadata/due-date';

interface SingleTaskMetadataProps {
  task: TaskType;
}

export const SingleTaskMetadata = observer(
  ({ task }: SingleTaskMetadataProps) => {
    return (
      <div className="p-2 mx-2 flex gap-2 rounded bg-grayAlpha-50 items-center">
        <ScheduleDropdown task={task} />
        <DuedateDropdown task={task} />
      </div>
    );
  },
);
