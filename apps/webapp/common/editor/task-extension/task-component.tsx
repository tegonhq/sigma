import { Command, CommandInput, CommandItem, CommandList } from '@tegonhq/ui';
import { NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import {
  getStatusColor,
  getStatusIcon,
} from 'modules/tasks/status-dropdown/status-utils';

import type { TaskType } from 'common/types';

import { useCreateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { TaskItem } from './task-item-editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskComponent = observer((props: any) => {
  const [value, setValue] = React.useState('');

  const inputRef = React.useRef(null);

  const { tasksStore, pagesStore } = useContextStore();
  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: (data: TaskType) => {
      props.updateAttributes({
        id: data.id,
      });
    },
  });

  const tasksWithTitle = tasksStore.tasks.map((task) => ({
    ...task,
    title: pagesStore.getPageWithId(task.pageId)?.title,
  }));

  const filteredTasks = tasksWithTitle
    .filter(
      (task) =>
        task.title?.toLowerCase().includes(value.toLowerCase()) ||
        task.number.toString().toLowerCase().includes(value.toLowerCase()),
    )
    .slice(0, 10); // Limit to 10 results;

  const id = props.node.attrs.id;

  const task = tasksStore.getTaskWithId(id);

  React.useEffect(() => {
    if (!task && !id && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const onBlur = () => {
    // If there's no value and no task selected, delete the node
    if (!value && !task) {
      props.deleteNode();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.deleteNode();

      setTimeout(() => {
        props.editor?.chain().focus().run();
      }, 0); // Ensure it runs after the node is deleted
    }
  };

  if (!task) {
    return (
      <NodeViewWrapper className="react-component-with-content" as="span">
        <Command
          className="w-fit relative rounded text-base"
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Search task..."
            value={value}
            onBlur={onBlur}
            ref={inputRef}
            id="searchTask"
            icon
            containerClassName="border-none px-1"
            onKeyDown={onKeyDown}
            className="py-0.5 px-1 h-7"
            onValueChange={setValue}
          />

          <CommandList className="flex-1">
            {filteredTasks.map((task) => {
              const CategoryIcon = getStatusIcon(task.status);

              return (
                <CommandItem
                  key={task.id}
                  className="max-w-[300px]"
                  onSelect={() => {
                    props.updateAttributes({
                      id: task.id,
                    });
                  }}
                >
                  <div className="flex gap-1 items-center">
                    <CategoryIcon
                      size={16}
                      color={getStatusColor(task.status).color}
                    />
                    <div className="shrink-0 w-[35px] text-sm">
                      T-{task.number}
                    </div>

                    <div className="w-[200px]">
                      <div className="truncate"> {task?.title}</div>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
            {filteredTasks.length === 0 && (
              <CommandItem
                key="new"
                className="max-w-[700px]"
                onSelect={() => {
                  addTaskMutation({
                    title: value,
                    status: 'Todo',
                  });
                }}
              >
                Create task: {value}
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="react-component-with-content" as="span">
      <TaskItem task={task} />
    </NodeViewWrapper>
  );
});
