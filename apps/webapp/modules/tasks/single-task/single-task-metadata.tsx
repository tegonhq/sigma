import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { ScheduleDropdown } from '../metadata';
import { DuedateDropdown } from '../metadata/due-date';
import { SubTasks } from '../metadata/sub-tasks';
import { Badge, ParentIssueLine } from '@tegonhq/ui';
import { useContextStore } from 'store/global-context-provider';
import React from 'react';
import { TaskViewContext } from 'layouts/side-task-view';
import { TaskExternalInfo } from '../task-external-info';

interface SingleTaskMetadataProps {
  task: TaskType;
}

export const SingleTaskMetadata = observer(
  ({ task }: SingleTaskMetadataProps) => {
    const { tasksStore, pagesStore } = useContextStore();
    const { openTask } = React.useContext(TaskViewContext);

    const parentTask = () => {
      const parent = tasksStore.getTaskWithId(task?.parentId);
      const page = pagesStore.getPageWithId(parent?.pageId);

      if (page) {
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 shrink min-w-[0px] h-7 px-2 text-base"
            onClick={() => openTask(parent.id)}
          >
            <ParentIssueLine size={16} />{' '}
            <span className="text-muted-foreground">Parent</span>{' '}
            <span className="max-w-[100px] truncate">{page?.title}</span>
          </Badge>
        );
      }

      return null;
    };

    return (
      <div className="p-2 mx-2 flex gap-2 rounded bg-grayAlpha-50 items-center">
        <ScheduleDropdown task={task} />
        <DuedateDropdown task={task} />
        <SubTasks taskId={task.id} />
        {task.parentId && parentTask()}
        <TaskExternalInfo task={task} />
      </div>
    );
  },
);
