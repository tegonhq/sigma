import { ResizablePanel, ResizablePanelGroup } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { RightSideLayout } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';

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
  const { tabs } = useApplication();
  const firstTab = tabs[0];

  return (
    <RightSideLayout header={<></>}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          maxSize={16}
          defaultSize={16}
          minSize={16}
          collapsible
          collapsedSize={16}
          className="h-[calc(100vh)] min-w-[200px] border-r-1 border-border"
        >
          <ListPageHeader />
          <ListsList selected={firstTab.entity_id} />
        </ResizablePanel>
        <ResizablePanel
          collapsible
          collapsedSize={0}
          className="flex flex-col w-full h-[calc(100vh)]"
        >
          {list && <ListPage list={list} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </RightSideLayout>
  );
});
