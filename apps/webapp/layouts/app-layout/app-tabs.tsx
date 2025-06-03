import {
  AddLine,
  Button,
  Close,
  cn,
  Inbox,
  IssuesLine,
  Project,
  Separator,
} from '@redplanethq/ui';
import { MessageSquare } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideViewContext } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';

import { TabViewType, type TabType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { WorkspaceDropdown } from './workspace-dropdown';

export const AppTabs = observer(({ addTab }: { addTab: () => void }) => {
  const { tabs, removeTab, activeTab, setActiveTab, changeActiveTab } =
    useApplication();
  const { collapsed, onOpen, onClose } = React.useContext(RightSideViewContext);
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

  useHotkeys(
    [
      `${Key.Meta}+1`,
      `${Key.Meta}+2`,
      `${Key.Meta}+3`,
      `${Key.Meta}+4`,
      `${Key.Meta}+5`,
      `${Key.Meta}+6`,
      `${Key.Meta}+7`,
      `${Key.Meta}+8`,
      `${Key.Meta}+9`,
    ],
    (event) => {
      // Get the number from the key combination (1-9)
      const index = parseInt(event.key) - 1;

      // Check if tabs has a tab at that index
      if (tabs[index]) {
        setActiveTab(tabs[index].id);
      }
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

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

    return 'home';
  };

  const goTo = (type: TabViewType) => {
    changeActiveTab(type, {});
  };

  return (
    <div className="bg-transparent h-7 tabs-list rounded-none flex gap-2 w-full">
      <div className="flex gap-1 items-center shrink-0">
        <WorkspaceDropdown />

        <Button variant="ghost" onClick={() => goTo(TabViewType.ASSISTANT)}>
          <Inbox size={20} />
        </Button>

        <Button variant="ghost" onClick={() => goTo(TabViewType.MY_TASKS)}>
          <IssuesLine size={18} />
        </Button>

        <Button variant="ghost" onClick={() => goTo(TabViewType.LIST)}>
          <Project size={18} />
        </Button>

        <Separator className="w-[0.5px] h-6" orientation="vertical" />
      </div>

      <div className="grow overflow-x-auto scrollbar-hide flex items-center pl-1 gap-1">
        {tabs.map((tab, index) => {
          return (
            <Button
              value={tab.id}
              key={index}
              variant="link"
              className={cn(
                'flex gap-2 px-3 rounded flex-shrink-0 items-center h-7 shrink-0 group max-w-[100px] bg-grayAlpha-100 text-muted-foreground hover:text-foreground',
                activeTab.id === tab.id &&
                  'bg-background-3 text-foreground dark:bg-accent dark:text-accent-foreground',
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {getIcon(tab)} <p className="truncate">{getTabName(tab)}</p>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="hidden group-hover:block"
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

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0"
          onClick={() => {
            addTab();
          }}
        >
          <AddLine size={20} />
        </Button>
      </div>

      <div className="flex items-center">
        {activeTab.type !== TabViewType.ASSISTANT && (
          <Button
            variant={collapsed ? 'ghost' : 'secondary'}
            className="gap-1 items-center h-8"
            onClick={() => (collapsed ? onOpen('') : onClose())}
          >
            <MessageSquare size={16} /> Chat
          </Button>
        )}
      </div>
    </div>
  );
});
