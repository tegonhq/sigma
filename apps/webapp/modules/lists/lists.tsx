import { ResizablePanel, ResizablePanelGroup } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { ListPage } from './list-page';
import { ListView } from './list-view';

interface TabsProps {
  entity_id: string;
}

export const Lists = observer(({ entity_id }: TabsProps) => {
  useScope(SCOPES.List);

  const { listsStore } = useContextStore();
  const list = listsStore.getListWithId(entity_id);
  const { changeActiveTab } = useApplication();

  useHotkeys(
    [Key.Escape],
    () => {
      changeActiveTab(TabViewType.LIST, {});
    },
    {
      scopes: [SCOPES.List],
    },
  );

  if (!list) {
    return <ListView />;
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        collapsible
        collapsedSize={0}
        className="flex flex-col w-full h-[calc(100vh_-_52px)]"
      >
        {list && <ListPage list={list} />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
});
