import {
  AddLine,
  Button,
  CalendarLine,
  cn,
  DocumentLine,
  Inbox,
  IssuesLine,
  Project,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@tegonhq/ui';
import { RefreshCcw } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import getConfig from 'next/config';
import Image from 'next/image';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Updates } from 'modules/updates/updates';

import { getPlatformModifierKey } from 'common/common-utils';
import { getIcon } from 'common/icon-picker';
import { SCOPES } from 'common/shortcut-scopes';
import type { ListType } from 'common/types';

import { useApplication } from 'hooks/application';
import { useLists, type ListTypeWithCount } from 'hooks/list';

import { useCreateListMutation } from 'services/lists';

import { TabViewType } from 'store/application';

import { WorkspaceDropdown } from './workspace-dropdown';
const { publicRuntimeConfig } = getConfig();

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
            navigate(TabViewType.DAYS);
            return;
          case '2':
            navigate(TabViewType.MY_TASKS);
            break;
          case '3':
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
        case TabViewType.DAYS:
          updateTabType(0, TabViewType.DAYS, {
            data: {
              date: new Date(),
            },
          });

          return;
        case TabViewType.LIST:
          closeRightScreen();
          updateTabType(0, TabViewType.LIST, id ? { entityId: id } : {});
          return;
        default:
          updateTabType(0, page, {});
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
                  isActive={firstTab.type === TabViewType.SYNC}
                  onClick={() => navigate(TabViewType.SYNC)}
                >
                  <Inbox className="h-4 w-4" />
                  Inbox
                </Button>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Button
                  variant="secondary"
                  className="flex gap-1 w-fit"
                  isActive={firstTab.type === TabViewType.DAYS}
                  onClick={() => navigate(TabViewType.DAYS)}
                >
                  <CalendarLine className="h-4 w-4" />
                  Today
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

              <SidebarMenuItem>
                <Button
                  variant="secondary"
                  className="flex gap-1 w-fit"
                  isActive={
                    firstTab.type === TabViewType.LIST && !firstTab.entity_id
                  }
                  onClick={() => navigate(TabViewType.LIST)}
                >
                  <Project className="h-4 w-4" />
                  Lists
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <h3 className="text-sm text-muted-foreground mb-1 flex justify-between items-center">
              <p>Favourites</p>
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
                const isActive =
                  firstTab.type === TabViewType.LIST &&
                  firstTab.entity_id === list.id;
                return (
                  <SidebarMenuItem key={list.id}>
                    <Button
                      variant="secondary"
                      className={cn(
                        'flex gap-1 w-fit min-w-0 justify-start',
                        list.name?.length > 10 && 'w-full',
                      )}
                      isActive={isActive}
                      onClick={() => navigate(TabViewType.LIST, list.id)}
                    >
                      {getIcon(
                        list?.icon,
                        15,
                        isActive && 'text-accent-foreground',
                      )}
                      <div className="inline-flex items-center gap-1 shrink min-w-[0px]">
                        <div className="truncate">
                          {list.name ? list.name : 'Untitled'}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'ml-0.5 text-muted-foreground',
                          isActive && 'text-accent-foreground',
                        )}
                      >
                        {list.count}
                      </span>
                    </Button>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="text-sm text-muted-foreground flex items-center justify-between gap-2">
            <Image
              src="/logo_light.svg"
              alt="logo"
              key={1}
              width={20}
              height={20}
            />
            v{publicRuntimeConfig.NEXT_PUBLIC_VERSION}
          </div>
          <Updates />
        </SidebarFooter>
      </Sidebar>
    );
  },
);
