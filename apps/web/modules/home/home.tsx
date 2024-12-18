'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { Activity } from 'modules/activity';
import { AI } from 'modules/ai';
import { Instructions } from 'modules/instructions';
import { MyDay } from 'modules/my-day';
import { Tasks } from 'modules/tasks';

import { ContentBox } from 'common/content-box';
import { useLocalCommonState } from 'common/use-local-state';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { TabContext } from 'store/tab-context';

import { Tabs } from './tabs';
import { useShortcuts } from './use-shortcuts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponent(componentType: string, props: any) {
  if (componentType === TabViewType.MY_DAY) {
    return <MyDay {...props} />;
  }

  if (componentType === TabViewType.MY_TASKS) {
    return <Tasks {...props} />;
  }

  if (componentType === TabViewType.INSTRUCTIONS) {
    return <Instructions {...props} />;
  }

  if (componentType === TabViewType.AI) {
    return <AI {...props} />;
  }

  return <MyDay />;
}

export const Home = observer(() => {
  const { tabs, setActiveTab, rightScreenCollapsed } = useApplication();
  const [size, setSize] = useLocalCommonState('panelSize', 15);
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
          className="flex pl-0"
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
            minSize={25}
            defaultSize={size}
            onResize={(size) => setSize(size)}
            order={2}
            id="rightScreen"
            onClick={() => secondTab && setActiveTab(secondTab.id)} // Change activeTab on focus
            className="flex pl-0 samp2"
          >
            <TabContext.Provider value={{ tabId: secondTab?.id }}>
              <ContentBox className="pl-0">
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
