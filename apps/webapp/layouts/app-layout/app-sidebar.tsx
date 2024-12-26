import {
  AI,
  Button,
  CalendarLine,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SubIssue,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { getPlatformModifierKey } from 'common/common-utils';
import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

import { WorkspaceDropdown } from './workspace-dropdown';

export const AppSidebar = observer(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { updateTabType, updateTabData, closeRightScreen, tabs } =
      useApplication();
    const firstTab = tabs[0];

    useHotkeys(
      [
        `${getPlatformModifierKey()}+1`,
        `${getPlatformModifierKey()}+2`,
        `${getPlatformModifierKey()}+3`,
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event) => {
        switch (event.key) {
          case '1':
            navigate(TabViewType.MY_DAY);
            return;
          case '2':
            navigate(TabViewType.MY_TASKS);
            return;
          case '3':
            navigate(TabViewType.AI);
        }
      },
      {
        scopes: [SCOPES.Global],
        enableOnFormTags: true,
        enableOnContentEditable: true,
      },
    );

    const navigate = (page: TabViewType) => {
      switch (page) {
        case TabViewType.MY_DAY:
          updateTabType(0, TabViewType.MY_DAY);
          updateTabData(0, {
            date: new Date(),
          });
          return;
        case TabViewType.MY_TASKS:
          updateTabType(0, TabViewType.MY_TASKS);
          return;
        case TabViewType.AI:
          closeRightScreen();
          updateTabType(0, TabViewType.AI);
      }
    };

    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader className="pl-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <WorkspaceDropdown />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <Button
                  variant="secondary"
                  className="flex gap-1 w-fit"
                  isActive={firstTab.type === TabViewType.MY_DAY}
                  onClick={() => navigate(TabViewType.MY_DAY)}
                >
                  <CalendarLine className="h-4 w-4" />
                  My day
                </Button>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Button
                  variant="secondary"
                  className="flex gap-1 w-fit"
                  isActive={firstTab.type === TabViewType.MY_TASKS}
                  onClick={() => navigate(TabViewType.MY_TASKS)}
                >
                  <SubIssue className="h-4 w-4" />
                  Tasks
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="secondary"
                  className="flex gap-1 w-fit"
                  isActive={firstTab.type === TabViewType.AI}
                  onClick={() => navigate(TabViewType.AI)}
                >
                  <AI className="h-4 w-4" />
                  Agent
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  },
);
