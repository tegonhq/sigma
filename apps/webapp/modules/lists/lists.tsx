import { ResizablePanel, ResizablePanelGroup } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import { useContextStore } from 'store/global-context-provider';

import { ListPage } from './list-page';
import { ListsList } from './list-view';

interface TabsProps {
  entity_id: string;
}

export const Lists = observer(({ entity_id }: TabsProps) => {
  const { listsStore } = useContextStore();
  const list = listsStore.getListWithId(entity_id);
  const { activeTab } = useApplication();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        maxSize={16}
        defaultSize={16}
        minSize={16}
        collapsible
        collapsedSize={16}
        className="h-[calc(100vh_-_40px)] min-w-[200px] border-r-1 border-border"
      >
        <ListsList selected={activeTab.entity_id} />
      </ResizablePanel>
      <ResizablePanel
        collapsible
        collapsedSize={0}
        className="flex flex-col w-full h-[calc(100vh_-_40px)]"
      >
        {list && <ListPage list={list} />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
});
