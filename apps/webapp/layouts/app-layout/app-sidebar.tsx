import {
  AddLine,
  Button,
  CalendarLine,
  cn,
  IssuesLine,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { getPlatformModifierKey } from 'common/common-utils';
import { getIcon } from 'common/icon-picker';
import { SCOPES } from 'common/shortcut-scopes';
import type { ListType } from 'common/types';

import { useApplication } from 'hooks/application';
import { useLists, type ListTypeWithCount } from 'hooks/list';

import { useCreateListMutation } from 'services/lists';

import { TabViewType } from 'store/application';

import { WorkspaceDropdown } from './workspace-dropdown';

export const AppSidebar = observer(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { updateTabType, closeRightScreen, tabs } = useApplication();
    const firstTab = tabs[0];
    const lists = useLists();
    const { mutate: createList } = useCreateListMutation({
      onSuccess: (data: ListType) => {
        navigate(TabViewType.LIST, data.id);
      },
    });

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

    const navigate = (page: TabViewType, id?: string) => {
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
          return;
        case TabViewType.LIST:
          closeRightScreen();
          updateTabType(0, TabViewType.LIST, { entityId: id });
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
                  <IssuesLine className="h-4 w-4" />
                  Tasks
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <h3 className="text-sm text-muted-foreground mb-1 flex justify-between items-center">
              <p>Lists</p>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  createList();
                }}
              >
                <AddLine size={12} />
              </Button>
            </h3>
            <SidebarMenu className="gap-0.5">
              {lists.map((list: ListTypeWithCount) => {
                return (
                  <SidebarMenuItem key={list.id}>
                    <Button
                      variant="secondary"
                      className={cn(
                        'flex gap-1 w-fit min-w-0 justify-start',
                        list.name?.length > 10 && 'w-full',
                      )}
                      isActive={
                        firstTab.type === TabViewType.LIST &&
                        firstTab.entity_id === list.id
                      }
                      onClick={() => navigate(TabViewType.LIST, list.id)}
                    >
                      {getIcon(list?.icon, 14)}
                      <div className="inline-flex items-center gap-1 shrink min-w-[0px]">
                        <div className="truncate">
                          {list.name ? list.name : 'Untitled'}
                        </div>
                      </div>
                      <span className="ml-0.5 text-muted-foreground">
                        {list.count}
                      </span>
                    </Button>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  },
);
