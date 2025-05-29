import { observer } from 'mobx-react-lite';
import React from 'react';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { GroupingEnum } from 'store/application';

import { Filters } from './filters';
import { ScheduleList } from './group-view/schedule';
import { StatusList } from './group-view/status';
import { SingleTask } from './single-task';

interface TabsProps {
  entity_id: string;
}

export const Tasks = observer(({ entity_id }: TabsProps) => {
  useScope(SCOPES.Tasks);

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
    if (displaySettings.grouping === GroupingEnum.schedule) {
      return <ScheduleList />;
    }

    return <StatusList />;
  };

  return (
    <RightSideLayout>
      <Filters />

      {getComponent()}
    </RightSideLayout>
  );
});
