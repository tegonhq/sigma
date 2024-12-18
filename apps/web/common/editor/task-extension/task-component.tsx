import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  TodoLine,
  type TaskType,
} from '@tegonhq/ui';
import { NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import {
  getStatusColor,
  getStatusIcon,
} from 'modules/tasks/status-dropdown/status-utils';

import { useApplication } from 'hooks/application';

import { useContextStore } from 'store/global-context-provider';
import { useCreateTaskMutation } from 'services/tasks';
import { TabViewType } from 'store/application';

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

  const { updateTabType } = useApplication();

  const tasksWithTitle = tasksStore.tasks.map((task) => ({
    ...task,
    title: pagesStore.getPageWithId(task.pageId).title,
  }));
  const filteredTasks = tasksWithTitle
    .filter((task) => task.title.toLowerCase().includes(value.toLowerCase()))
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

  if (!task) {
    return (
      <NodeViewWrapper className="react-component-with-content" as="span">
        <Command
          className="w-fit relative rounded text-base"
          shouldFilter={false}
        >
          <div className="flex items-center">
            <TodoLine size={20} className="pl-1" />
            <CommandInput
              placeholder="Search task..."
              value={value}
              onBlur={onBlur}
              ref={inputRef}
              id="searchTask"
              containerClassName="border-none px-1 w-full"
              className="py-0.5 px-1 h-6 w-full"
              onValueChange={setValue}
            />
          </div>

          <CommandList className="flex-1 max-h-[100%]">
            {filteredTasks.map((task) => (
              <CommandItem
                key={task.id}
                className="max-w-[300px]"
                onSelect={() => {
                  props.updateAttributes({
                    id: task.id,
                  });
                }}
              >
                {task.title}
              </CommandItem>
            ))}
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

  const page = pagesStore.getPageWithId(task?.pageId);

  const openTask = () => {
    updateTabType(1, TabViewType.MY_TASKS, id);
  };

  const CategoryIcon = getStatusIcon(task.status);

  return (
    <NodeViewWrapper className="react-component-with-content" as="span">
      <a
        className="gap-1 bg-grayAlpha-100 py-0.5 px-1 rounded box-decoration-clone"
        contentEditable={false}
        onClick={openTask}
      >
        <span>
          <span className="inline-flex items-center justify-bottom top-1 relative">
            <CategoryIcon size={18} color={getStatusColor(task.status).color} />
          </span>
        </span>
        <span> {page?.title}</span>
      </a>
    </NodeViewWrapper>
  );
});
