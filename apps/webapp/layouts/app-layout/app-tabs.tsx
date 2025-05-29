import { Button, Close, cn, Inbox, IssuesLine, Project } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import { TabViewType, type TabType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

export const AppTabs = observer(() => {
  const { tabs, removeTab, activeTab, setActiveTab } = useApplication();
  const { tasksStore, listsStore, pagesStore } = useContextStore();

  const getIcon = (tab: TabType) => {
    if (tab.type === TabViewType.MY_TASKS) {
      return <IssuesLine size={18} className="shrink-0" />;
    }

    if (tab.type === TabViewType.LIST) {
      return <Project size={18} className="shrink-0" />;
    }

    return <Inbox size={18} className="shrink-0" />;
  };

  const getTabName = (tab: TabType) => {
    if (tab.type === TabViewType.MY_TASKS) {
      if (tab.entity_id) {
        const task = tasksStore.getTaskWithId(tab.entity_id);
        const page = pagesStore.getPageWithId(task?.pageId);

        return page ? page?.title : 'task';
      }
      return 'tasks';
    }

    if (tab.type === TabViewType.LIST) {
      if (tab.entity_id) {
        const list = listsStore.getListWithId(tab.entity_id);
        const page = pagesStore.getPageWithId(list?.pageId);

        return page ? page?.title : 'list';
      }

      return 'list';
    }

    return 'assistant';
  };

  return (
    <div className="bg-transparent h-9 tabs-list rounded-none flex gap-2 overflow-x-auto scrollbar-hide">
      {tabs.map((tab, index) => {
        return (
          <Button
            value={tab.id}
            key={index}
            variant="link"
            className={cn(
              'flex gap-2 px-3 rounded-lg flex-shrink-0 items-center h-9',
              activeTab.id === tab.id &&
                'bg-background-2 rounded-bl-none rounded-br-none',
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {getIcon(tab)}{' '}
            <p className="max-w-[100px] truncate">{getTabName(tab)}</p>
            {index > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  removeTab(tab.id);
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Close size={14} />
              </Button>
            )}
          </Button>
        );
      })}
    </div>
  );
});
