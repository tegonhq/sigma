import { Button, cn, Inbox, IssuesLine, Project } from '@redplanethq/ui';
import { MessageSquare } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { AIThinking } from 'modules/ai-thinking';

import { SCOPES } from 'common/shortcut-scopes';
import { TooltipWrapper } from 'common/tooltip';
import { RightSideViewContext } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

import { WorkspaceDropdown } from './workspace-dropdown';

export const AppTabs = observer(() => {
  const { activeTab, changeActiveTab } = useApplication();
  const { collapsed, onOpen, onClose } = React.useContext(RightSideViewContext);

  // Use a ref to track if 'g' was pressedAdd commentMore actions
  const gKeyPressed = React.useRef(false);
  const gKeyTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Handle the 'g' key pressAdd commentMore actions
  useHotkeys(
    'g',
    () => {
      gKeyPressed.current = true;

      // Reset the g key state after a short delay
      if (gKeyTimeout.current) {
        clearTimeout(gKeyTimeout.current);
      }

      gKeyTimeout.current = setTimeout(() => {
        gKeyPressed.current = false;
      }, 1000); // Reset after 1 second
    },
    {
      scopes: [SCOPES.Global],
      keyup: false,
      keydown: true,
    },
  );

  useHotkeys(
    ['h', 't', 'l'],
    (event) => {
      if (gKeyPressed.current) {
        switch (event.key) {
          case 'h':
            changeActiveTab(TabViewType.ASSISTANT, {});
            break;
          case 't':
            changeActiveTab(TabViewType.MY_TASKS, {});
            break;
          case 'l':
            changeActiveTab(TabViewType.LIST, {});
            break;
        }
        gKeyPressed.current = false;
        if (gKeyTimeout.current) {
          clearTimeout(gKeyTimeout.current);
        }
      }
    },
    {
      scopes: [SCOPES.Global],
    },
  );

  const goTo = (type: TabViewType) => {
    changeActiveTab(type, {});
  };

  return (
    <div className="tabs-list rounded-none flex gap-2 w-full justify-between items-center mt-2">
      <div className="flex rounded-md items-center px-2 h-11">
        <WorkspaceDropdown />
      </div>
      <div className="flex gap-1 items-center shrink-0 p-1.5 px-1.5 bg-background-3 rounded-md shadow">
        <TooltipWrapper tooltip="G then H">
          <Button
            variant="ghost"
            onClick={() => goTo(TabViewType.ASSISTANT)}
            className={cn(
              'gap-1',
              activeTab.type === TabViewType.ASSISTANT && 'bg-grayAlpha-100',
            )}
          >
            <Inbox size={20} /> Home
          </Button>
        </TooltipWrapper>
        <TooltipWrapper tooltip="G then T">
          <Button
            variant="ghost"
            onClick={() => goTo(TabViewType.MY_TASKS)}
            className={cn(
              'gap-1',
              activeTab.type === TabViewType.MY_TASKS && 'bg-grayAlpha-100',
            )}
          >
            <IssuesLine size={18} /> Tasks
          </Button>
        </TooltipWrapper>
        <TooltipWrapper tooltip="G then L">
          <Button
            variant="ghost"
            onClick={() => goTo(TabViewType.LIST)}
            className={cn(
              'gap-1',
              activeTab.type === TabViewType.LIST && 'bg-grayAlpha-100',
            )}
          >
            <Project size={18} /> List
          </Button>
        </TooltipWrapper>

        <AIThinking />
      </div>

      <div
        className={cn(
          'flex items-center h-9 rounded-md px-1 py-1 mr-1 w-[40px] bg-background-3',
          activeTab.type === TabViewType.ASSISTANT && 'bg-transparent',
        )}
      >
        {activeTab.type !== TabViewType.ASSISTANT && (
          <Button
            variant={collapsed ? 'ghost' : 'secondary'}
            className="gap-1 items-center h-7"
            onClick={() => (collapsed ? onOpen('') : onClose())}
          >
            <MessageSquare size={16} />
          </Button>
        )}
      </div>
    </div>
  );
});
