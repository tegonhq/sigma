import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskViewContext } from 'layouts/side-task-view';

import { useContextStore } from 'store/global-context-provider';

export const TaskMetadata = observer(({ taskId }: { taskId: string }) => {
  const { tasksStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);
  const { openTask } = React.useContext(TaskViewContext);

  return (
    <div
      className={cn('flex items-start shrink-0 gap-2 h-4 text-xs')}
      contentEditable={false}
    >
      <div
        className="text-muted-foreground font-mono text-sm relative top-[1px]"
        onClick={() => {
          openTask(task.id);
        }}
      >
        T-{task.number}
      </div>
    </div>
  );
});
