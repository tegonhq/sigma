import { Checkbox, cn } from '@tegonhq/ui';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TaskInfo } from 'modules/tasks/task-info';

import type { TaskType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { TaskMetadata } from './task-metadata';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskComponent = observer((props: any) => {
  const taskId = props.node.attrs.id;

  const { tasksStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);

  const { mutate: updateTask } = useUpdateTaskMutation({
    onSuccess: (data: TaskType) => {
      props.updateAttributes({
        id: data.id,
      });
    },
  });

  const statusChange = (status: string) => {
    updateTask({
      taskId: task.id,
      status,
    });
  };

  return (
    <NodeViewWrapper className="task-item-component" as="div">
      <div
        className={cn(
          'items-center inline-flex gap-2 pb-0.5 items-start px-2 -ml-2 hover:bg-grayAlpha-100 rounded w-fit',
          props.selected && 'bg-grayAlpha-300',
        )}
      >
        <label
          className={cn('flex items-start shrink-0 gap-2 py-1')}
          contentEditable={false}
        >
          <Checkbox
            className="shrink-0 relative top-[1px] h-[18px] w-[18px]"
            checked={task?.status === 'Done'}
            contentEditable={false}
            onCheckedChange={(value) => {
              statusChange(value === true ? 'Done' : 'Todo');
            }}
          />
        </label>

        <NodeViewContent
          as="p"
          className={cn(
            'relative top-[2px] min-w-[3px]',
            task?.status === 'Done' &&
              'line-through opacity-60 decoration-[1px] decoration-transparent animate-multiline-strikethrough',
          )}
        />
        {task && (
          <div
            className={cn('flex items-start shrink-0 gap-2 pt-1 !text-sm')}
            contentEditable={false}
          >
            <TaskMetadata taskId={task.id} />
            <TaskInfo task={task} inEditor />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
});
