'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@sigma/ui/components/resizable';
import { DocumentLine, Inbox, IssuesLine } from '@sigma/ui/icons';
import { cn } from '@sigma/ui/lib/utils';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AllProviders } from 'common/wrappers/all-providers';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { BottomBar } from './bottom-bar';
import { Nav } from './nav';
import { PageList } from './page-list';
import { WorkspaceDropdown } from './workspace-dropdown';
import { ScrollArea } from '@sigma/ui/components/scroll-area';

interface LayoutProps {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

const AppLayoutChild = observer(({ children }: LayoutProps) => {
  const { applicationStore } = useContextStore();

  return (
    <div className="h-[100vh] w-[100vw] flex">
      <ResizablePanelGroup direction="horizontal">
        {!applicationStore.sidebarCollapsed && (
          <ResizablePanel
            maxSize={20}
            defaultSize={10}
            id="sidebar"
            minSize={10}
            collapsible
            order={1}
            collapsedSize={10}
          >
            <ScrollArea className="h-full">
              <div className="min-w-[180px] flex flex-col h-full">
                <div className="flex flex-col py-4 pt-4 px-6">
                  <div className="flex justify-between items-center">
                    <WorkspaceDropdown />
                  </div>
                </div>
                <div className="mt-4 grow">
                  <div className="px-6 ">
                    <Nav
                      links={[
                        {
                          title: 'My day',
                          icon: Inbox,
                          href: TabViewType.MY_DAY,
                        },
                        {
                          title: 'All tasks',
                          icon: IssuesLine,
                          href: TabViewType.MY_TASKS,
                        },
                        {
                          title: 'All pages',
                          icon: DocumentLine,
                          href: TabViewType.MY_PAGES,
                        },
                      ]}
                    />
                  </div>
                  <PageList />
                </div>
                <BottomBar />
              </div>
            </ScrollArea>
          </ResizablePanel>
        )}

        <ResizableHandle />
        <ResizablePanel
          collapsible={false}
          order={2}
          className="flex items-center justify-center pl-0"
        >
          <div
            className={cn(
              'w-full',
              applicationStore.sidebarCollapsed && 'max-w-[100vw]',
              !applicationStore.sidebarCollapsed &&
                'max-w-[calc(100vw_-_180px)]',
            )}
          >
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
});

export function Layout(props: LayoutProps) {
  return (
    <AllProviders>
      <AppLayoutChild {...props} />
    </AllProviders>
  );
}
