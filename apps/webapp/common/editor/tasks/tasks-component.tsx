import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';

import { useEditor } from 'common/editor/editor';

export const TasksComponent = observer(() => {
  const { editor } = useEditor();

  return (
    <NodeViewWrapper className="tasks-component">
      <div className="flex flex-col p-2 bg-grayAlpha-50 rounded">
        <h2 className="mb-1"> Tasks </h2>

        <NodeViewContent className="content is-editable" />
      </div>
    </NodeViewWrapper>
  );
});
