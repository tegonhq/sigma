import { Checkbox } from '@tegonhq/ui';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskItemComponent = observer((props: any) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    console.log(props.node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.node.attrs.id, props.node.textContent]);

  return (
    <NodeViewWrapper className="task-item-component" as="span">
      <div className="flex gap-1 py-1 w-full items-start max-w-[600px]">
        <Checkbox className="relative top-[2px]" />
        <NodeViewContent
          className="content is-editable max-w-[600px]"
          as="span"
          onKeyDown={handleKeyDown}
        />
      </div>
    </NodeViewWrapper>
  );
});
