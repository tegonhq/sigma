import { Badge, ParentIssueLine } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getIcon } from 'common/icon-picker';
import type { TaskType } from 'common/types';
import { TaskViewContext } from 'layouts/side-task-view';

import { useContextStore } from 'store/global-context-provider';

import { ScheduleDropdown, ScheduleDropdownVariant } from './metadata';
import { DuedateDropdown, DuedateDropdownVariant } from './metadata/due-date';
import { SubTasks } from './metadata/sub-tasks';

export const TaskInfo = observer(
  ({
    task,
    taskOccurrenceId,
    inEditor,
  }: {
    task: TaskType;
    taskOccurrenceId?: string;
    inEditor?: boolean;
  }) => {
    const { listsStore, pagesStore, tasksStore } = useContextStore();
    const list = listsStore.getListWithId(task.listId);
    const page = pagesStore.getPageWithId(list?.pageId);
    const { openTask } = React.useContext(TaskViewContext);

    const parentTask = () => {
      const parent = tasksStore.getTaskWithId(task?.parentId);
      const page = pagesStore.getPageWithId(parent?.pageId);

      if (page) {
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 shrink min-w-[0px]"
            onClick={() => openTask(parent.id)}
          >
            <ParentIssueLine size={12} />{' '}
            <span className="text-muted-foreground">Parent</span>{' '}
            <span className="max-w-[100px] truncate">{page?.title}</span>
          </Badge>
        );
      }

      return null;
    };

    return (
      <div className="flex flex-col w-fit items-center">
        <div
          className="flex gap-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {list && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 shrink min-w-[0px]"
            >
              {getIcon(list?.icon, 12)} {page?.title}
            </Badge>
          )}
          {!inEditor && (
            <ScheduleDropdown
              task={task}
              variant={ScheduleDropdownVariant.SHORT}
              taskOccurrenceId={taskOccurrenceId}
            />
          )}
          <DuedateDropdown task={task} variant={DuedateDropdownVariant.SHORT} />
          <SubTasks taskId={task.id} />
          {task.parentId && parentTask()}
        </div>
      </div>
    );
  },
);
