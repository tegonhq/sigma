import type { CreateTaskDto } from '@sigma/types';

import { Checkbox, cn } from '@tegonhq/ui';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { getCreateTaskPropsOnSource } from 'modules/tasks/add-task/utils';

import type { TaskType } from 'common/types';

import { useCreateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { TaskMetadata } from './task-metadata';
import { EditorContext } from '../editor-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskComponent = observer((props: any) => {
  const { source, date } = React.useContext(EditorContext);

  const taskId = props.node.attrs.id;
  const content = props.node.textContent;

  const { tasksStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);

  const { mutate: addTaskMutation, isLoading } = useCreateTaskMutation({
    onSuccess: (data: TaskType) => {
      props.updateAttributes({
        id: data.id,
      });
    },
  });

  const debounceAddTask = useDebouncedCallback(async (props: CreateTaskDto) => {
    addTaskMutation(props);
  }, 500);

  React.useEffect(() => {
    if (!taskId && content && !content.includes('[') && !isLoading) {
      debounceAddTask({
        title: content,
        ...getCreateTaskPropsOnSource(source, date),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, taskId, isLoading]);

  return (
    <NodeViewWrapper className="task-item-component" as="p">
      <div
        className={cn(
          'items-center inline-flex gap-2 pb-0.5 items-start px-2 hover:bg-grayAlpha-100 rounded w-fit',
          props.selected && 'bg-grayAlpha-300',
        )}
      >
        <div
          className={cn('flex items-start shrink-0 gap-2 py-1')}
          contentEditable={false}
        >
          <Checkbox className="shrink-0 relative top-[1px] h-[18px] w-[18px]" />
        </div>

        <NodeViewContent as="p" className="text-sm relative top-[2px]" />
        {task && (
          <div
            className={cn('flex items-start shrink-0 gap-2 py-1')}
            contentEditable={false}
          >
            <TaskMetadata taskId={task.id} />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
});
