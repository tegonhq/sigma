'use client';

import { MyDay } from 'modules/my-day';
import { observer } from 'mobx-react-lite';
import { useApplication } from 'hooks/application';
import { Page } from 'modules/pages';

const ComponentMap = {
  my_day: MyDay,
  page: Page,
};

export const Home = observer(() => {
  const { activeTab: tab } = useApplication();
  const Component = ComponentMap[tab.type as keyof typeof ComponentMap];

  return (
    <>
      <Component />
    </>
  );
});
