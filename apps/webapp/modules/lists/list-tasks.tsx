import React from 'react';

import { StatusList } from 'modules/tasks/category/status';
import { Filters } from 'modules/tasks/filters';
import { Header } from 'modules/tasks/header';

import { SCOPES } from 'common/shortcut-scopes';
import { AILayout } from 'layouts/ai-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

export const ListTasks = () => {
  useScope(SCOPES.Task);

  const { clearSelectedTask } = useApplication();

  React.useEffect(() => {
    return () => {
      clearSelectedTask();
    };
  });

  return (
    <AILayout header={<Header />}>
      <Filters />

      <StatusList />
    </AILayout>
  );
};
