import {
  Badge,
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SubIssue,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskViewContext } from 'layouts/side-task-view';

import { useContextStore } from 'store/global-context-provider';

interface SubTasksProps {
  taskId: string;
}

export const SubTasks = observer(({ taskId }: SubTasksProps) => {
  const { tasksStore, pagesStore } = useContextStore();
  const subTasks = tasksStore.getSubTasks(taskId);
  const { openTask } = React.useContext(TaskViewContext);

  if (subTasks.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="secondary" className="flex items-center gap-1">
          <SubIssue size={14} />
          <span className="text-sm">
            {subTasks.filter((task) => task.status === 'Done').length}/
            {subTasks.length}
          </span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="p-1">
        {subTasks.map((task) => {
          const page = pagesStore.getPageWithId(task?.pageId);
          return (
            <Button
              variant="ghost"
              className="flex gap-1 w-full justify-start"
              key={task.id}
              onClick={() => {
                openTask(task.id);
              }}
            >
              <div className="text-muted-foreground font-mono min-w-[40px] pl-1 text-xs self-center">
                T-{task.number}
              </div>
              <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                <div
                  className={cn(
                    'text-left truncate',
                    task.status === 'Done' &&
                      'line-through opacity-60 decoration-[1px]',
                  )}
                >
                  {page?.title}
                </div>
              </div>
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
});
