import { Badge, Project } from '@tegonhq/ui';
import { Hash } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export const TaskInfo = observer(({ task }: { task: TaskType }) => {
  const { listsStore } = useContextStore();
  const list = listsStore.getListWithId(task.listId);

  if (!list) {
    return null;
  }

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
            <Project size={12} /> {list?.name}
          </Badge>
        )}
      </div>
    </div>
  );
});
