import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

export const TaskMetadata = observer(({ taskId }: { taskId: string }) => {
  const { tasksStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);

  return (
    <div
      className={cn('flex items-center shrink-0 gap-2 leading-[20px]')}
      contentEditable={false}
    >
      <div className="text-muted-foreground font-mono min-w-[40px] text-xs self-center">
        T-{task.number}
      </div>
    </div>
  );
});
