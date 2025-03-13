import type { CreateTaskDto } from '@sigma/types';

import { Checkbox, cn } from '@tegonhq/ui';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { getCreateTaskPropsOnSource } from 'modules/tasks/add-task/utils';
import { TaskInfo } from 'modules/tasks/task-info';

import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useCreateTaskMutation, useUpdateTaskMutation } from 'services/tasks';

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
  const { selectedTasks, setHoverTask, hoverTask } = useApplication();

  const { mutate: addTaskMutation, isLoading } = useCreateTaskMutation({
    onSuccess: (data: TaskType) => {
      props.updateAttributes({
        id: data.id,
      });
    },
  });

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

  const debounceAddTask = useDebouncedCallback(async (props: CreateTaskDto) => {
    addTaskMutation(props);
  }, 500);

  React.useEffect(() => {
    if (!taskId && content && content.trim() && !isLoading) {
      debounceAddTask({
        title: content,
        ...getCreateTaskPropsOnSource(source, date),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, taskId, isLoading]);

  return (
    <NodeViewWrapper className="task-item-component" as="div">
      <div
        className={cn(
          'items-center inline-flex gap-2 pb-0.5 items-start px-2 -ml-2 hover:bg-grayAlpha-100 rounded w-fit',
          props.selected && 'bg-grayAlpha-300',
        )}
        onMouseOver={() => {
          if (selectedTasks.length === 0 && task && task.id !== hoverTask) {
            setHoverTask(task.id);
          }
        }}
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
            'text-sm relative top-[2px]',
            task?.status === 'Done' &&
              'line-through opacity-60 decoration-[1px] decoration-transparent animate-multiline-strikethrough',
          )}
        />
        {task && (
          <div
            className={cn('flex items-start shrink-0 gap-2 py-1 !text-sm')}
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
