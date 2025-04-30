import { observer } from 'mobx-react-lite';

import { RightSideLayout } from 'layouts/right-side-layout';

import { useContextStore } from 'store/global-context-provider';

import { ListPage } from './list-page';
import { ListPageHeader } from './list-page-header';
import { ListsList } from './list-view';

interface TabsProps {
  entity_id: string;
}

export const Lists = observer(({ entity_id }: TabsProps) => {
  const { listsStore } = useContextStore();
  const list = listsStore.getListWithId(entity_id);

  if (list) {
    return <ListPage list={list} />;
  }

  return (
    <RightSideLayout header={<ListPageHeader />}>
      <ListsList />
    </RightSideLayout>
  );
});
