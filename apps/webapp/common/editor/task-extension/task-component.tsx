import { Checkbox, cn } from '@redplanethq/ui';
import { SourceType } from '@sol/types';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { isSameDay } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskInfo } from 'modules/tasks/task-info';

import type { TaskType } from 'common/types';

import { useUpdateSingleTaskOccurrenceMutation } from 'services/task-occurrence';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { TaskMetadata } from './task-metadata';
import { EditorContext } from '../editor-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskComponent = observer((props: any) => {
  const taskId = props.node.attrs.id;
  const { source, date } = React.useContext(EditorContext);
  const { tasksStore, taskOccurrencesStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);
  const { mutate: updateTaskOccurrence } =
    useUpdateSingleTaskOccurrenceMutation({});

  const getTaskOccurrence = () => {
    const taskOccurrences =
      taskOccurrencesStore.getTaskOccurrencesForTask(taskId);

    return taskOccurrences.find((occurrence) => {
      if (!occurrence.startTime) {
        return false;
      }

      const occurrenceDate = new Date(occurrence.startTime);
      return isSameDay(occurrenceDate, date);
    });
  };

  const taskOccurrence = getTaskOccurrence();

  const { mutate: updateTask } = useUpdateTaskMutation({
    onSuccess: (data: TaskType) => {
      props.updateAttributes({
        id: data.id,
      });
    },
  });

  const statusChange = (status: string) => {
    if (task && task.recurrence.length > 0 && taskOccurrence) {
      updateTaskOccurrence({
        taskOccurrenceId: taskOccurrence.id,
        status,
      });
      return;
    }

    updateTask({
      taskId: task.id,
      status,
    });
  };

  const getStatus = () => {
    if (task && task.recurrence.length > 0 && taskOccurrence) {
      return taskOccurrence?.status;
    }

    return task?.status;
  };

  return (
    <NodeViewWrapper className="task-item-component" as="div">
      <div
        className={cn(
          'items-center inline-flex gap-2 pb-0.5 mb-1 items-start px-2 -ml-2 hover:bg-grayAlpha-100 rounded w-fit',
          props.selected && 'bg-grayAlpha-300',
        )}
      >
        <label
          className={cn('flex items-start shrink-0 gap-2 py-1')}
          contentEditable={false}
        >
          <Checkbox
            className="shrink-0 relative top-[1px] h-[18px] w-[18px]"
            checked={getStatus() === 'Done'}
            onCheckedChange={(value) => {
              statusChange(value === true ? 'Done' : 'Todo');
            }}
          />
        </label>

        <NodeViewContent
          as="p"
          className={cn(
            'relative top-[2px] min-w-[3px]',
            getStatus() === 'Done' &&
              'line-through opacity-60 decoration-[1px] decoration-muted-foreground',
          )}
        />
        {task && (
          <div
            className={cn('flex items-start shrink-0 gap-2 pt-1 !text-sm')}
            contentEditable={false}
          >
            <TaskMetadata taskId={task.id} />
            <TaskInfo task={task} inEditor={source.type === SourceType.PAGE} />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
});
