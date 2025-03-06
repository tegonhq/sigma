import { observer } from 'mobx-react-lite';
import React from 'react';

import { PlanList } from 'modules/tasks/group-view/plan';
import { StatusList } from 'modules/tasks/group-view/status';
import { Filters } from 'modules/tasks/filters';
import { Header } from 'modules/tasks/header';

import { SCOPES } from 'common/shortcut-scopes';
import { AILayout } from 'layouts/ai-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { GroupingEnum } from 'store/application';

export const ListTasks = observer(() => {
  useScope(SCOPES.Task);

  const { clearSelectedTask, displaySettings } = useApplication();

  React.useEffect(() => {
    return () => {
      clearSelectedTask();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getComponent = () => {
    if (displaySettings.grouping === GroupingEnum.plan) {
      return <PlanList />;
    }

    return <StatusList />;
  };

  return (
    <AILayout header={<Header />}>
      <Filters />

      {getComponent()}
    </AILayout>
  );
});
