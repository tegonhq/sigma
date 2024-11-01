import { Button } from '@sigma/ui/components/ui/button';
import {
  AI,
  ArrowLeft,
  ArrowRight,
  DocumentLine,
  RightSidebarClosed,
  RightSidebarOpen,
} from '@sigma/ui/icons';
import { cn } from '@sigma/ui/lib/utils';
import { observer } from 'mobx-react-lite';

export const TITLE = {
  my_day: 'My day',
  my_pages: 'My pages',
  my_tasks: 'My tasks',
  my_events: 'My events',
};

import { useApplication } from 'hooks/application/use-application';

import { TabViewType, type TabType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';
import { historyManager } from 'store/history';

import { SidebarExpand } from './layout/sidebar-expand';

export const Tabs = observer(() => {
  const { activeTab, back, forward, updateRightScreen, rightScreenCollapsed } =
    useApplication();
  const { pagesStore } = useContextStore();

  const getTitle = (tab: TabType) => {
    return tab.type === TabViewType.PAGE
      ? pagesStore.getPageWithId(tab.entity_id)?.title ?? 'Untitled'
      : TITLE[tab.type as keyof typeof TITLE];
  };

  return (
    <div className="flex gap-1 p-3 pb-0 items-center w-full">
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

      <div
        className={cn(
          'flex shrink w-full gap-2 justify-center bg-grayAlpha-100 border-none rounded px-2 py-1',
        )}
        key={activeTab.id}
      >
        <DocumentLine className="shrink-0" />

        <span className="flex items-center justify-start shrink min-w-[0px] max-w-[80vw]">
          <span className="truncate">{getTitle(activeTab)}</span>
        </span>
      </div>

      <div className="flex gap-1 ml-2">
        <Button
          variant="ghost"
          onClick={() => updateRightScreen(!rightScreenCollapsed)}
        >
          <AI />
        </Button>
        <Button
          variant="ghost"
          onClick={() => updateRightScreen(!rightScreenCollapsed)}
        >
          {open ? (
            <RightSidebarOpen size={18} />
          ) : (
            <RightSidebarClosed size={18} />
          )}
        </Button>
      </div>
    </div>
  );
});
