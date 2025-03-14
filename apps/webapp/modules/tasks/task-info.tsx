import { Badge, Project } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

import { ScheduleDropdown, ScheduleDropdownVariant } from './metadata';
import { DuedateDropdown, DuedateDropdownVariant } from './metadata/due-date';
import { getIcon } from 'common/icon-picker';

export const TaskInfo = observer(
  ({
    task,
    taskOccurrenceId,
    inEditor = false,
  }: {
    task: TaskType;
    taskOccurrenceId?: string;
    inEditor?: boolean;
  }) => {
    const { listsStore, pagesStore } = useContextStore();
    const list = listsStore.getListWithId(task.listId);
    const page = pagesStore.getPageWithId(list?.pageId);

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
          <ScheduleDropdown
            task={task}
            variant={ScheduleDropdownVariant.SHORT}
            taskOccurrenceId={taskOccurrenceId}
          />
          <DuedateDropdown task={task} variant={DuedateDropdownVariant.SHORT} />
        </div>
      </div>
    );
  },
);
