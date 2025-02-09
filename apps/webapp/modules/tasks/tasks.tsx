import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { AILayout } from 'layouts/ai-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { StatusList } from './category/status';
import { Filters } from './filters';
import { Header } from './header';
import { SingleTask } from './single-task';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
