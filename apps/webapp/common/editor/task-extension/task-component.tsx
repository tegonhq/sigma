import { cn, Input } from '@tegonhq/ui';
import { NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getCreateTaskPropsOnSource } from 'modules/tasks/add-task/utils';

import type { TaskType } from 'common/types';

import { useCreateTaskMutation } from 'services/tasks';

import { TaskMetadata } from './task-metadata';
import { EditorContext } from '../editor-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskComponent = observer((props: any) => {
  const { source, date } = React.useContext(EditorContext);
  const [value, setValue] = React.useState('');
  const taskId = props.node.attrs.id;
  const editor = props.editor;
  const inputRef = React.useRef(null);
  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: (data: TaskType) => {
      props.updateAttributes({
        id: data.id,
      });
    },
  });

  console.log(props.node.attrs);
  const submitTask = () => {
    if (!value) {
      props.deleteNode();
    }

    addTaskMutation({
      title: value,
      ...getCreateTaskPropsOnSource(source, date),
    });
  };

  React.useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      submitTask();
      editor.chain().focus().run();
    }

    if (event.key === 'Escape') {
      props.deleteNode();
      editor.chain().focus().run();
    }

    if (event.key === 'ArrowUp') {
      submitTask();

      editor
        .chain()
        .focus()
        .setTextSelection(editor.state.selection.$anchor.before())
        .run();
    }

    if (event.key === 'ArrowDown') {
      submitTask();

      editor
        .chain()
        .focus()
        .setTextSelection(editor.state.selection.$anchor.after())
        .run();
    }
  };

  return (
    <NodeViewWrapper className="task-item-component" as="span">
      <div
        className={cn(
          'items-center inline-flex gap-1 mx-1 h-6 items-center max-w-[100%] px-2 bg-grayAlpha-100 rounded text-sm relative top-[2px]',
          taskId && 'w-fit',
          props.selected && 'bg-grayAlpha-300',
        )}
      >
        <TaskMetadata taskId={props.node.attrs.id} />

        {!taskId && (
          <Input
            className="content is-editable max-w-[600px] bg-transparent h-5 px-0 py-0"
            onChange={(e) => setValue(e.currentTarget.value)}
            value={value}
            ref={inputRef}
            onBlur={submitTask}
            onKeyDown={onKeyDown}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
});
