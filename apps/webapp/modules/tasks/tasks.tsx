import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import type { IntegrationAccountType } from 'common/types';
import { AILayout } from 'layouts/ai-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { useContextStore } from 'store/global-context-provider';

import { Filters } from './filters';
import { Header } from './header';
import { PersonalTaskCategory } from './personal-task-category';
import { SingleTask } from './single-task';
import { TaskCategory } from './task-category';
import { StatusList } from './category/status';

interface TabsProps {
  entity_id: string;
}

export const Tasks = observer(({ entity_id }: TabsProps) => {
  useScope(SCOPES.Task);

  const { clearSelectedTask } = useApplication();

  React.useEffect(() => {
    return () => {
      clearSelectedTask();
    };
  });

  if (entity_id && entity_id !== 'my_tasks') {
    return <SingleTask index={0} taskId={entity_id} />;
  }

  return (
    <AILayout header={<Header />}>
      <Filters />

      <StatusList />
    </AILayout>
  );
});
