import { Button, ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import type { IntegrationAccountType } from 'common/types';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { useContextStore } from 'store/global-context-provider';

import { PersonalTaskCategory } from './personal-task-category';
import { SingleTask } from './single-task';
import { TaskCategory } from './task-category';

export const Tasks = observer(() => {
  useScope(SCOPES.Task);
  const { tabs } = useApplication();
  const secondTab = tabs[1];
  const { integrationAccountsStore } = useContextStore();
  const [newTask, setNewTask] = React.useState(false);

  useHotkeys(
    [`${Key.Meta}+n`, `${Key.Control}+n`],
    () => {
      setNewTask(true);
    },
    {
      scopes: [SCOPES.Task],
    },
  );

  if (secondTab.entity_id && secondTab.entity_id !== 'my_tasks') {
    return <SingleTask index={1} />;
  }

  return (
    <ScrollArea className="w-full h-full p-4" id="status-list">
      <div className="flex justify-between pb-4 items-center">
        <h2 className="text-lg"> Tasks</h2>

        <Button variant="secondary" onClick={() => setNewTask(true)}>
          Add task
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <PersonalTaskCategory newTask={newTask} setNewTask={setNewTask} />

        {integrationAccountsStore.integrationAccounts.map(
          (integationAccount: IntegrationAccountType, index: number) => (
            <TaskCategory integrationAccount={integationAccount} key={index} />
          ),
        )}
      </div>
    </ScrollArea>
  );
});
