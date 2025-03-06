import { SourceType } from '@sigma/types';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { isToday, isTomorrow } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { EditorContext } from '../editor-context';

export const TasksComponent = observer(() => {
  const { source, date } = React.useContext(EditorContext);

  const getTitle = () => {
    if (source.type === SourceType.TASK) {
      return 'Sub tasks';
    }

    if (!date) {
      return 'Tasks';
    }

    if (isToday(date)) {
      return 'Today tasks';
    }
    if (isTomorrow(date)) {
      return 'Tomorrow tasks';
    }

    return 'Tasks';
  };

  return (
    <NodeViewWrapper className="tasks-component">
      <div className="flex flex-col p-2 bg-grayAlpha-50 rounded">
        <h2 className="mb-1"> {getTitle()} </h2>

        <NodeViewContent className="content is-editable" />
      </div>
    </NodeViewWrapper>
  );
});
