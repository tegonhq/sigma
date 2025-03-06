import { Checkbox, cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskViewContext } from 'layouts/side-task-view';

import { useApplication } from 'hooks/application';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { TaskInfo } from './task-info';

interface TaskListItemProps {
  taskId: string;
}

export const TaskListItem = observer(({ taskId }: TaskListItemProps) => {
  const { tasksStore, pagesStore } = useContextStore();
  const { openTask } = React.useContext(TaskViewContext);
  const {
    selectedTasks,
    setHoverTask,
    hoverTask,
    addToSelectedTask,
    removeSelectedTask,
  } = useApplication();
  const task = tasksStore.getTaskWithId(taskId);
  const page = pagesStore.getPageWithId(task?.pageId);
  const { mutate: updateTask } = useUpdateTaskMutation({});
  const taskSelected = selectedTasks.includes(task?.id);

  const statusChange = (status: string) => {
    updateTask({
      taskId: task.id,
      status,
    });
  };

  const taskSelect = (taskId: string) => {
    openTask(taskId);
  };

  if (!task) {
    return null;
  }

  return (
    <div
      className="pl-1 pr-2 flex group cursor-default gap-2"
      onClick={() => {
        taskSelect(taskId);
      }}
      onMouseOver={() => {
        if (selectedTasks.length === 0 && task.id !== hoverTask) {
          setHoverTask(task.id);
        }
      }}
    >
      <div className="w-full flex items-center">
        <div
          className={cn(
            'flex items-center py-2.5 pl-4 group-hover:pl-0',
            taskSelected && 'pl-0',
          )}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              className={cn(
                'hidden group-hover:block',
                taskSelected && 'block',
              )}
              onCheckedChange={(checked) => {
                if (checked) {
                  addToSelectedTask(task.id, false);
                } else {
                  removeSelectedTask(task.id);
                }
              }}
              checked={taskSelected}
            />
          </div>
        </div>
        <div
          className={cn(
            'flex w-full items-start gap-2 pl-2 ml-1 pr-2 group-hover:bg-grayAlpha-100 rounded-xl shrink min-w-[0px]',
            taskSelected && 'bg-primary/10',
          )}
        >
          <div
            className="pt-2 shrink-0 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              className="shrink-0 relative top-0.5 h-[18px] w-[18px]"
              checked={task.status === 'Done'}
              onCheckedChange={(value: boolean) =>
                statusChange(value === true ? 'Done' : 'Todo')
              }
            />
          </div>

          <div
            className={cn(
              'flex flex-col w-full py-2 border-b border-border shrink min-w-[0px]',
            )}
          >
            <div className="flex w-full justify-between gap-4 items-center">
              <div className="flex gap-1 w-full items-center">
                <div className="text-muted-foreground font-mono min-w-[40px] pl-1 text-sm self-center">
                  T-{task.number}
                </div>
                <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                  <div className="text-left truncate">{page?.title}</div>
                </div>
                <TaskInfo task={task} />
              </div>

              <div className="flex items-center gap-2 flex-wrap pr-1 shrink-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
