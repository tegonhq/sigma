import { Button } from '@sigma/ui/components/ui/button';
import { AddLine, ArrowLeft, ArrowRight, CrossLine } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';

import { TabViewType, type TabType } from 'store/application';

export const TITLE = {
  my_day: 'My day',
  my_pages: 'My pages',
  my_tasks: 'My tasks',
  my_events: 'My events',
};

import { SidebarExpand } from './sidebar-expand';
import { useApplication } from 'hooks/application/use-application';
import { historyManager } from 'store/history';
import { useContextStore } from 'store/global-context-provider';

export const Tabs = observer(() => {
  const { tabs, activeTab, addTab, removeTab, back, forward, setActiveTab } =
    useApplication();
  const { pagesStore } = useContextStore();

  const getTitleComponent = (tab: TabType) => {
    const title =
      tab.type === TabViewType.PAGE
        ? pagesStore.getPageWithId(tab.entity_id).title
        : TITLE[tab.type as keyof typeof TITLE];

    return (
      <div className="flex items-center w-full group">
        <div className="flex grow justify-center">{title}</div>
        <Button
          variant="link"
          className="w-7"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            removeTab(tab.id);
          }}
        >
          <CrossLine size={16} className="hidden group-hover:flex" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex gap-1 p-3 pb-0 items-center">
      <div className="flex items-center">
        <SidebarExpand />
        <Button
          variant="ghost"
          size="sm"
          onClick={back}
          disabled={!historyManager.canGoBack}
        >
          <ArrowLeft size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={forward}
          disabled={!historyManager.canGoForward}
        >
          <ArrowRight size={14} />
        </Button>
      </div>

      <div className="flex gap-1 grow shrink">
        {tabs.map((tab: TabType) => (
          <Button
            variant="secondary"
            className="flex gap-1 items-center"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            isActive={activeTab?.id === tab.id}
            full
          >
            {getTitleComponent(tab)}
          </Button>
        ))}
      </div>

      <Button variant="ghost" onClick={addTab}>
        <AddLine size={16} />
      </Button>
    </div>
  );
});
