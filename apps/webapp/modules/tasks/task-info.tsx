import { Badge, cn, ParentIssueLine } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getIcon } from 'common/icon-picker';
import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { ScheduleDropdown, ScheduleDropdownVariant } from './metadata';
import { DuedateDropdown, DuedateDropdownVariant } from './metadata/due-date';
import { SubTasks, SubTaskVariant } from './metadata/sub-tasks';
import { TaskExternalInfo, TaskExternalVariant } from './task-external-info';

export const TaskInfo = observer(
  ({
    task,
    taskOccurrenceId,
    minimal,
    inEditor,
  }: {
    task: TaskType;
    taskOccurrenceId?: string;
    inEditor?: boolean;
    minimal: boolean;
  }) => {
    const { listsStore, pagesStore, tasksStore } = useContextStore();
    const list = listsStore.getListWithId(task.listId);
    const page = pagesStore.getPageWithId(list?.pageId);
    const { changeActiveTab } = useApplication();

    const parentTask = () => {
      const parent = tasksStore.getTaskWithId(task?.parentId);
      const page = pagesStore.getPageWithId(parent?.pageId);

      if (page) {
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 shrink min-w-[0px]"
            onClick={() =>
              changeActiveTab(TabViewType.MY_TASKS, { entityId: parent.id })
            }
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
      <div className="flex flex-col w-fit items-center shrink-0">
        <div
          className="flex gap-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {list && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 shrink max-w-[300px]"
            >
              {getIcon(list?.icon, 14)}
              <span className="shrink  min-w-[0px] truncate">
                {page?.title}
              </span>
            </Badge>
          )}
          {!inEditor && !minimal && (
            <ScheduleDropdown
              task={task}
              variant={ScheduleDropdownVariant.SHORT}
              taskOccurrenceId={taskOccurrenceId}
            />
          )}
          <DuedateDropdown task={task} variant={DuedateDropdownVariant.SHORT} />{' '}
          <SubTasks taskId={task.id} variant={SubTaskVariant.SHORT} />
          {task.parentId && parentTask()}
          <div className={cn(inEditor && 'relative')}>
            <TaskExternalInfo task={task} variant={TaskExternalVariant.SHORT} />
          </div>
        </div>
      </div>
    );
  },
);
