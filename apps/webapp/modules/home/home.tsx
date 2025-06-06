import { observer } from 'mobx-react-lite';
import React from 'react';

import { Conversation } from 'modules/conversation';
import { Assistant } from 'modules/inbox';
import { Lists } from 'modules/lists';
import { Tasks } from 'modules/tasks';
import { initIntegrations } from 'modules/tasks/utils';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';
import { AppLayout } from 'layouts/app-layout';

import { useApplication } from 'hooks/application';
import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';

import { useWindowListener } from './window-listener';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponent(componentType: string, props: any) {
  if (componentType === TabViewType.MY_TASKS) {
    return <Tasks {...props} />;
  }

  if (componentType === TabViewType.LIST) {
    return <Lists {...props} />;
  }

  if (componentType === TabViewType.ASSISTANT) {
    return <Assistant {...props} />;
  }

  if (componentType === TabViewType.AI) {
    return <Conversation {...props} />;
  }

  return <Assistant />;
}

export const Home = observer(() => {
  useScope(SCOPES.Global);
  const { activeTab } = useApplication();
  useWindowListener();

  const ipc = useIPC();

  // Init integrations here will download the latest integration definitions
  // in the cache
  React.useEffect(() => {
    initIntegrations(ipc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full">
      {getComponent(activeTab.type, { entity_id: activeTab.entity_id })}
    </div>
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
