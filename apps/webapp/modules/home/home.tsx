import { observer } from 'mobx-react-lite';

import { AI } from 'modules/ai';
import { Instructions } from 'modules/instructions';
import { ListPage } from 'modules/lists';
import { MyDay } from 'modules/my-day';
import { SearchDialog } from 'modules/search';
import { Tasks } from 'modules/tasks';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';
import { AppLayout } from 'layouts/app-layout';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';

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

  return (
    <div className="flex flex-col h-full">
      {getComponent(firstTab.type, { entity_id: firstTab.entity_id })}
      <SearchDialog />
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
