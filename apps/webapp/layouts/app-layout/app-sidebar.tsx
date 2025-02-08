import {
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
import { useLists, type ListTypeWithCount } from 'hooks/list';
import type { ListType } from 'common/types';
import { Hash } from 'lucide-react';

export const AppSidebar = observer(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { updateTabType, closeRightScreen, tabs } = useApplication();
    const firstTab = tabs[0];
    const lists = useLists();

    useHotkeys(
      [`${getPlatformModifierKey()}+1`, `${getPlatformModifierKey()}+2`],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event) => {
        switch (event.key) {
          case '1':
            navigate(TabViewType.MY_DAY);
            return;
          case '2':
            navigate(TabViewType.MY_TASKS);
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
          updateTabType(0, TabViewType.MY_DAY, {
            data: {
              date: new Date(),
            },
          });

          return;
        case TabViewType.MY_TASKS:
          updateTabType(0, TabViewType.MY_TASKS, {});
          return;
        case TabViewType.AI:
          closeRightScreen();
          updateTabType(0, TabViewType.AI, {});
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
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <h3 className="text-sm text-muted-foreground mb-1">Lists</h3>
            <SidebarMenu className="gap-0.5">
              {lists.map((list: ListTypeWithCount) => (
                <>
                  {list.count > 0 ? (
                    <SidebarMenuItem key={list.id}>
                      <Button
                        variant="secondary"
                        className="flex gap-1 w-fit"
                        onClick={() => {}}
                      >
                        <Hash size={14} /> {list.name}
                        <span className="ml-0.5 text-muted-foreground">
                          {list.count}
                        </span>
                      </Button>
                    </SidebarMenuItem>
                  ) : null}
                </>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  },
);
