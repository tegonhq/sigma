'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@sigma/ui/components/resizable';
import { observer } from 'mobx-react-lite';

import { EmptyTab } from 'modules/empty-tab';
import { MyDay } from 'modules/my-day';
import { Page } from 'modules/pages';

import { ContentBox } from 'common/content-box';

import { useApplication } from 'hooks/application';

import { TabContext } from 'store/tab-context';

import { useShortcuts } from './use-shortcuts';
import { Tabs } from './tabs';
import { cn } from '@sigma/ui/lib/utils';

function getComponent(componentType: string, props: any) {
  if (componentType === 'page') {
    return <Page {...props} />;
  }

  if (componentType === 'my_day') {
    return <MyDay {...props} />;
  }

  return <EmptyTab />;
}

export const Home = observer(() => {
  const { tabs, setActiveTab, rightScreenCollapsed, sidebarCollapsed } =
    useApplication();
  useShortcuts();
  const secondTab = tabs[1];
  const firstTab = tabs[0];

  return (
    <div className="h-[100vh]">
      <Tabs />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          collapsible={false}
          onClick={() => {
            setActiveTab(firstTab.id);
          }}
          order={1}
          id="home"
          className={cn('flex samp1', sidebarCollapsed ? 'pl-3' : 'pl-0')}
        >
          <TabContext.Provider value={{ tabId: firstTab.id }}>
            <ContentBox>
              {getComponent(firstTab.type, { pageId: firstTab.entity_id })}
            </ContentBox>
          </TabContext.Provider>
        </ResizablePanel>
        <ResizableHandle />
        {!rightScreenCollapsed && (
          <ResizablePanel
            collapsible={false}
            maxSize={50}
            minSize={10}
            defaultSize={15}
            order={2}
            id="rightScreen"
            onClick={() => secondTab && setActiveTab(secondTab.id)} // Change activeTab on focus
            className="flex pl-0 samp2"
          >
            <TabContext.Provider value={{ tabId: secondTab?.id }}>
              <ContentBox>
                {getComponent(secondTab?.type, {
                  pageId: secondTab?.entity_id,
                })}
              </ContentBox>
            </TabContext.Provider>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
});
