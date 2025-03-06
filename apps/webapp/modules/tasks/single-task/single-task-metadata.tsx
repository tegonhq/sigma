import { observer } from 'mobx-react-lite';

import type { ListType, TaskType } from 'common/types';

import { useCreateListMutation } from 'services/lists';
import { useUpdateTaskMutation } from 'services/tasks';

import { ScheduleDropdown, StatusDropdown, ListDropdown } from '../metadata';
import { PlanDropdown } from '../metadata/plan';

interface SingleTaskMetadataProps {
  task: TaskType;
}

export const SingleTaskMetadata = observer(
  ({ task }: SingleTaskMetadataProps) => {
    const { mutate: updateTask } = useUpdateTaskMutation({});
    const { mutate: createList } = useCreateListMutation({});

    const statusChange = (status: string) => {
      updateTask({
        taskId: task.id,
        status,
      });
    };

    const listChange = (listId: string) => {
      if (listId && listId.includes('__new')) {
        createList(
          {
            name: listId.replace('__new', ''),
          },
          {
            onSuccess: (list: ListType) => {
              updateTask({
                taskId: task.id,
                listId: list.id,
              });
            },
          },
        );

        return;
      }

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
        <PlanDropdown task={task} />
      </div>
    );
  },
);
