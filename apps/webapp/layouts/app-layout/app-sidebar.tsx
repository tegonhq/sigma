import {
  AI,
  Button,
  CalendarLine,
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
import Image from 'next/image';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Updates } from 'modules/updates/updates';

import { Shortcut } from 'common/shortcut';
import { SCOPES } from 'common/shortcut-scopes';
import { TooltipWrapper } from 'common/tooltip';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

import { WorkspaceDropdown } from './workspace-dropdown';

export const AppSidebar = observer(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { updateTabType, closeRightScreen, tabs } = useApplication();
    const firstTab = tabs[0];

    // Use a ref to track if 'g' was pressed
    const gKeyPressed = React.useRef(false);
    const gKeyTimeout = React.useRef<NodeJS.Timeout | null>(null);

    // Handle the 'g' key press
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

    // Handle the individual shortcut keys after 'g'
    useHotkeys(
      ['a', 'm', 't', 'l'],
      (event) => {
        if (gKeyPressed.current) {
          switch (event.key) {
            case 'a':
              navigate(TabViewType.ASSISTANT);
              break;
            case 'm':
              navigate(TabViewType.MY_TASKS);
              break;
            case 't':
              navigate(TabViewType.DAYS);
              break;
            case 'l':
              navigate(TabViewType.LIST);
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
      <Sidebar
        collapsible="icon"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)]"
        variant="inset"
        {...props}
      >
        <SidebarHeader className="pl-0" style={{ marginTop: '0.1rem' }}>
          <SidebarMenu>
            <SidebarMenuItem className="pl-2 flex justify-center w-full">
              <Image
                src="/logo_light.svg"
                alt="logo"
                key={1}
                width={20}
                height={20}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem className="flex w-full justify-center">
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
                    isActive={firstTab.type === TabViewType.ASSISTANT}
                    onClick={() => navigate(TabViewType.ASSISTANT)}
                  >
                    <AI size={18} />
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>

              <SidebarMenuItem className="flex w-full justify-center">
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
                    <CalendarLine size={18} />
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex w-full justify-center">
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
                    <IssuesLine size={18} />
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>

              <SidebarMenuItem className="flex w-full justify-center">
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
                    isActive={firstTab.type === TabViewType.LIST}
                    onClick={() => navigate(TabViewType.LIST)}
                  >
                    <Project size={18} />
                  </Button>
                </TooltipWrapper>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="pl-0 mb-2">
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <WorkspaceDropdown />
          </div>
          <Updates />
        </SidebarFooter>
      </Sidebar>
    );
  },
);
