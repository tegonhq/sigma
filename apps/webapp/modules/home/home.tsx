import { observer } from 'mobx-react-lite';

import { AI } from 'modules/ai';
import { Instructions } from 'modules/instructions';
import { ListPage } from 'modules/lists';
import { MyDay } from 'modules/my-day';
import { SearchDialog } from 'modules/search';
import { Tasks } from 'modules/tasks';
import { AddTaskDialogProvider } from 'modules/tasks/add-task';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';
import { AppLayout } from 'layouts/app-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';
import React from 'react';
import { useIPC } from 'hooks/ipc';
import { initIntegrations } from 'modules/tasks/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponent(componentType: string, props: any) {
  if (componentType === TabViewType.MY_DAY) {
    return <MyDay />;
  }

  if (componentType === TabViewType.MY_TASKS) {
    return <Tasks {...props} />;
  }

  if (componentType === TabViewType.LIST) {
    return <ListPage {...props} />;
  }

  if (componentType === TabViewType.INSTRUCTIONS) {
    return <Instructions {...props} />;
  }

  if (componentType === TabViewType.AI) {
    return <AI {...props} />;
  }

  return <MyDay />;
}

export const Home = observer(() => {
  useScope(SCOPES.Global);
  const { tabs } = useApplication();

  const firstTab = tabs[0];
  const ipc = useIPC();

  // Init integrations here will download the latest integration definitions
  // in the cache
  React.useEffect(() => {
    initIntegrations(ipc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AddTaskDialogProvider>
      <div className="flex flex-col h-full">
        {getComponent(firstTab.type, { entity_id: firstTab.entity_id })}
        <SearchDialog />
      </div>
    </AddTaskDialogProvider>
  );
});

export const HomeWrapper = () => {
  return <Home />;
};

HomeWrapper.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <AllProviders>
      <AppLayout>{page}</AppLayout>
    </AllProviders>
  );
};
