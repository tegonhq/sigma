import {
  AddLine,
  Button,
  CalendarLine,
  cn,
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
import { observer } from 'mobx-react-lite';
import getConfig from 'next/config';
import Image from 'next/image';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Updates } from 'modules/updates/updates';

import { getIcon } from 'common/icon-picker';
import { Shortcut } from 'common/shortcut';
import { SCOPES } from 'common/shortcut-scopes';
import { TooltipWrapper } from 'common/tooltip';
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
      [`g+i`, `g+m`, `g+t`, `g+l`],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event) => {
        switch (event.key) {
          case 'i':
            navigate(TabViewType.SYNC);
            return;
          case 'm':
            navigate(TabViewType.MY_TASKS);
            return;
          case 't':
            navigate(TabViewType.DAYS);
            return;
          case 'l':
            navigate(TabViewType.LIST);
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
                <TooltipWrapper
                  tooltip={
                    <>
                      Go to inbox <Shortcut shortcut="G + I" />
                    </>
                  }
                >
                  <Button
                    variant="secondary"
                    className="flex gap-1 w-fit"
                    isActive={firstTab.type === TabViewType.SYNC}
                    onClick={() => navigate(TabViewType.SYNC)}
                  >
                    <Inbox className="h-4 w-4" />
                    Inbox
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <TooltipWrapper
                  tooltip={
                    <>
                      Go to today <Shortcut shortcut="G + T" />
                    </>
                  }
                >
                  <Button
                    variant="secondary"
                    className="flex gap-1 w-fit"
                    isActive={firstTab.type === TabViewType.DAYS}
                    onClick={() => navigate(TabViewType.DAYS)}
                  >
                    <CalendarLine className="h-4 w-4" />
                    Today
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <TooltipWrapper
                  tooltip={
                    <>
                      Go to tasks <Shortcut shortcut="G + M" />
                    </>
                  }
                >
                  <Button
                    variant="secondary"
                    className="flex gap-1 w-fit"
                    isActive={firstTab.type === TabViewType.MY_TASKS}
                    onClick={() => navigate(TabViewType.MY_TASKS)}
                  >
                    <IssuesLine className="h-4 w-4" />
                    Tasks
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <TooltipWrapper
                  tooltip={
                    <>
                      Go to lists <Shortcut shortcut="G + L" />
                    </>
                  }
                >
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
                </TooltipWrapper>
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
