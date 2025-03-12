import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { GroupingEnum } from 'store/application';

import { PlanList } from './group-view/plan';
import { StatusList } from './group-view/status';
import { Filters } from './filters';
import { Header } from './header';
import { SingleTask } from './single-task';

interface TabsProps {
  entity_id: string;
}

export const Tasks = observer(({ entity_id }: TabsProps) => {
  useScope(SCOPES.Task);

  const { clearSelectedTask, displaySettings } = useApplication();

  React.useEffect(() => {
    return () => {
      clearSelectedTask();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (entity_id && entity_id !== 'my_tasks') {
    return <SingleTask index={0} taskId={entity_id} />;
  }

  const getComponent = () => {
    if (displaySettings.grouping === GroupingEnum.plan) {
      return <PlanList />;
    }

    return <StatusList />;
  };

  return (
    <RightSideLayout header={<Header />}>
      <Filters />

      {getComponent()}
    </RightSideLayout>
  );
});
