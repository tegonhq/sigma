import { Checkbox, cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { SCOPES } from 'common/shortcut-scopes';
import { TooltipWrapper } from 'common/tooltip';
import { TaskViewContext } from 'layouts/side-task-view';

import { useApplication } from 'hooks/application';

import { useUpdateSingleTaskOccurrenceMutation } from 'services/task-occurrence';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { TaskInfo } from './task-info';

interface TaskListItemProps {
  taskId: string;
}

export const TaskListItem = observer(
  ({ taskId: taskIdWithOccurrence }: TaskListItemProps) => {
    const { tasksStore, pagesStore, taskOccurrencesStore, agentWorklogsStore } =
      useContextStore();
    const { openTask } = React.useContext(TaskViewContext);
    const {
      selectedTasks,
      setHoverTask,
      hoverTask,
      addToSelectedTask,
      removeSelectedTask,
    } = useApplication();
    const taskId = taskIdWithOccurrence.split('__')[0];
    const taskOccurrenceId = taskIdWithOccurrence.split('__')[1];
    const agentWorklogForTask =
      agentWorklogsStore.getAgentWorklogForTask(taskId);

    const taskOccurrence = taskOccurrencesStore.getTaskOccurrenceWithTaskAndId(
      taskId,
      taskOccurrenceId,
    );
    const task = tasksStore.getTaskWithId(taskId);
    const page = pagesStore.getPageWithId(task?.pageId);
    const { mutate: updateTask } = useUpdateTaskMutation({});
    const taskSelected = selectedTasks.includes(taskIdWithOccurrence);
    const { mutate: updateTaskOccurrence } =
      useUpdateSingleTaskOccurrenceMutation({});

    const statusChange = (status: string) => {
      if (task && task.recurrence.length > 0 && taskOccurrenceId) {
        updateTaskOccurrence({
          taskOccurrenceId,
          status,
        });
        return;
      }

      updateTask({
        taskId: task.id,
        status,
      });
    };

    const taskSelect = (taskId: string) => {
      openTask(taskId);
    };

    const getStatus = () => {
      if (task && task.recurrence.length > 0 && taskOccurrence) {
        return taskOccurrence?.status;
      }

      return task.status;
    };

    useHotkeys(
      ['x'],
      () => {
        if (hoverTask === taskIdWithOccurrence) {
          if (!taskSelected) {
            addToSelectedTask(taskIdWithOccurrence, false);
          } else {
            removeSelectedTask(taskIdWithOccurrence);
          }
        }
      },
      {
        scopes: [SCOPES.Tasks],
        preventDefault: true,
      },
      [hoverTask, selectedTasks, taskSelected, taskIdWithOccurrence],
    );

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
          if (taskIdWithOccurrence !== hoverTask) {
            setHoverTask(taskIdWithOccurrence);
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
              <TooltipWrapper tooltip="">
                <Checkbox
                  className={cn(
                    'hidden group-hover:block',
                    taskSelected && 'block',
                  )}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addToSelectedTask(taskIdWithOccurrence, false);
                    } else {
                      removeSelectedTask(taskIdWithOccurrence);
                    }
                  }}
                  checked={taskSelected}
                />
              </TooltipWrapper>
            </div>
          </div>
          <div
            className={cn(
              'flex grow items-start gap-2 pl-2 ml-1 pr-2 group-hover:bg-grayAlpha-100 rounded-xl shrink min-w-[0px]',
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
                className="shrink-0 relative top-1 h-[18px] w-[18px]"
                checked={getStatus() === 'Done'}
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
                <div className="flex gap-2 w-full items-center min-w-[0px] shrink">
                  <div className="text-muted-foreground font-mono min-w-[40px] pl-1 relative top-[1px] text-sm self-center shrink-0">
                    T-{task.number}
                  </div>
                  <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                    <div
                      className={cn(
                        'text-left truncate',
                        getStatus() === 'Done' &&
                          'line-through opacity-60 decoration-[1px] decoration-muted-foreground',
                      )}
                    >
                      {page?.title}
                    </div>
                  </div>
                  <TaskInfo
                    task={task}
                    taskOccurrenceId={
                      task.startTime ? taskOccurrenceId : undefined
                    }
                  />

                  {agentWorklogForTask && (
                    <span
                      className="text-sm font-medium text-muted-foreground bg-gradient-to-r from-[#F48FD7] via-[#6528FD] to-[#F48FD7] 
            bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-slide"
                    >
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
