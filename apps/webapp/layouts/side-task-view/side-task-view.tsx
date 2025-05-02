import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SingleTask } from 'modules/tasks/single-task';

import { SCOPES } from 'common/shortcut-scopes';

import { useScope } from 'hooks/use-scope';

import { TaskViewContext } from './side-task-view-context';

export const SideTaskView = () => {
  useScope(SCOPES.SIDE_VIEW);
  const { closeTaskView, taskId } = React.useContext(TaskViewContext);

  useHotkeys(
    Key.Escape,
    (e) => {
      closeTaskView();

      e.preventDefault();
    },
    { scopes: [SCOPES.SIDE_VIEW] },
  );

  return (
    <div className="fixed inset-y-0 z-20 right-0 bottom-0 max-w-[70vw] w-[50vw] side-issue-view">
      <SingleTask sideView taskId={taskId} />
    </div>
  );
};
