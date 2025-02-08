import { Button } from '@tegonhq/ui';
import { Hash } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export const TaskInfo = observer(({ task }: { task: TaskType }) => {
  const { listsStore } = useContextStore();
  const list = listsStore.getListWithId(task.listId);

  return (
    <div className="flex flex-col w-fit">
      <div
        className="flex gap-2 pt-1"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button
          className="flex gap-1 text-xs items-center"
          variant="secondary"
          size="sm"
        >
          <Hash size={12} /> {list.name}
        </Button>
      </div>
    </div>
  );
});
