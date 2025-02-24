import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

export const TaskMetadata = observer(({ taskId }: { taskId: string }) => {
  const { tasksStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);

  return (
    <div
      className={cn('flex items-start shrink-0 gap-2 h-4 text-xs')}
      contentEditable={false}
    >
      <div className="text-muted-foreground font-mono min-w-[40px] relative bottom-[2px] text-xs">
        T-{task.number}
      </div>
    </div>
  );
});
