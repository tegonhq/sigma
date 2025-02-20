import { Checkbox } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

export const TaskMetadata = observer(({ taskId }: { taskId: string }) => {
  const { tasksStore, pagesStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);
  const page = pagesStore.getPageWithId(task?.pageId);

  return (
    <div
      className="flex items-center h- shrink-0 gap-1 py-1"
      contentEditable={false}
    >
      <Checkbox className="shrink-0" checked={task?.status === 'Done'} />

      {task && (
        <div className="text-muted-foreground font-mono text-sm self-center">
          T-{task?.number}
        </div>
      )}

      <p className="leading-[20px]">{page?.title}</p>
    </div>
  );
});
