import { cn } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

export const TaskMetadata = observer(({ taskId }: { taskId: string }) => {
  const { tasksStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);
  const { changeActiveTab } = useApplication();

  return (
    <div
      className={cn('flex items-start shrink-0 gap-2 h-4 text-sm')}
      contentEditable={false}
    >
      <div
        className="text-muted-foreground font-mono text-sm relative top-[1px]"
        onClick={() => {
          changeActiveTab(TabViewType.MY_TASKS, { entityId: task.id });
        }}
      >
        T-{task.number}
      </div>
    </div>
  );
});
