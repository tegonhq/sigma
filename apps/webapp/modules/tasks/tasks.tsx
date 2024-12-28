import { Button, ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import type { IntegrationAccountType } from 'common/types';
import { AILayout } from 'layouts/ai-layout';

import { useScope } from 'hooks/use-scope';

import { useContextStore } from 'store/global-context-provider';

import { Header } from './header';
import { PersonalTaskCategory } from './personal-task-category';
import { SingleTask } from './single-task';
import { TaskCategory } from './task-category';
import { useApplication } from 'hooks/application';

interface TabsProps {
  entity_id: string;
}

export const Tasks = observer(({ entity_id }: TabsProps) => {
  useScope(SCOPES.Task);
  const { integrationAccountsStore } = useContextStore();
  const [newTask, setNewTask] = React.useState(false);
  const { clearSelectedTask } = useApplication();

  useHotkeys(
    [`${Key.Meta}+n`, `${Key.Control}+n`],
    () => {
      setNewTask(true);
    },
    {
      scopes: [SCOPES.Task],
    },
  );

  React.useEffect(() => {
    return () => {
      clearSelectedTask();
    };
  });

  if (entity_id && entity_id !== 'my_tasks') {
    return <SingleTask index={0} taskId={entity_id} />;
  }

  return (
    <AILayout
      header={
        <Header
          actions={
            <Button variant="secondary" onClick={() => setNewTask(true)}>
              Add task
            </Button>
          }
        />
      }
    >
      <ScrollArea className="w-full h-full py-4 px-2" id="tasks-list">
        <div className="flex flex-col gap-4">
          <PersonalTaskCategory newTask={newTask} setNewTask={setNewTask} />

          {integrationAccountsStore.integrationAccounts.map(
            (integationAccount: IntegrationAccountType, index: number) => (
              <TaskCategory
                integrationAccount={integationAccount}
                key={index}
              />
            ),
          )}
        </div>
      </ScrollArea>
    </AILayout>
  );
});
