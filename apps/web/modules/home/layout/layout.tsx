'use client';

import { Button } from '@sigma/ui/components/button';
import { Inbox, SidebarLine } from '@sigma/ui/icons';
import { cn } from '@sigma/ui/lib/utils';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { AllProviders } from 'common/wrappers/all-providers';

import { useWorkspace } from 'hooks/workspace';

import { BottomBar } from './bottom-bar';
import { Nav } from './nav';

import { WorkspaceDropdown } from './workspace-dropdown';
import { useContextStore } from 'store/global-context-provider';

interface LayoutProps {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export const AppLayoutChild = observer(({ children }: LayoutProps) => {
  const { applicationStore } = useContextStore();
  const workspace = useWorkspace();

  return (
    <>
      <div className="h-[100vh] w-[100vw] flex">
        {!applicationStore.sidebarCollapsed && (
          <div className="min-w-[220px] flex flex-col">
            <div className="flex flex-col py-4 px-6">
              <div className="flex justify-between items-center">
                <WorkspaceDropdown />
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => applicationStore.updateSideBar(true)}
                >
                  <SidebarLine size={20} />
                </Button>
              </div>
            </div>
            <div className="px-6 mt-4 grow">
              <Nav
                links={[
                  {
                    title: 'My day',
                    icon: Inbox,
                    href: 'my',
                  },
                ]}
              />
            </div>
            <BottomBar />
          </div>
        )}

        <div
          className={cn(
            'w-full',
            applicationStore.sidebarCollapsed && 'max-w-[100vw]',
            !applicationStore.sidebarCollapsed && 'max-w-[calc(100vw_-_220px)]',
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
});

export function Layout(props: LayoutProps) {
  return (
    <AllProviders>
      <AppLayoutChild {...props} />
    </AllProviders>
  );
}
