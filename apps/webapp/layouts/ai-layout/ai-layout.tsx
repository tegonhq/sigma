import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useSidebar,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { AI } from 'modules/ai';

import { SCOPES } from 'common/shortcut-scopes';
import { useLocalCommonState } from 'common/use-local-state';

import { useApplication } from 'hooks/application';

import { TabContext } from 'store/tab-context';

interface AILayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export const AILayout = observer(({ children, header }: AILayoutProps) => {
  const [size, setSize] = useLocalCommonState('panelSize', 15);
  const [aiCollapsed, setAICollapsed] = React.useState(true);
  const { open } = useSidebar();

  const { tabs, setActiveTab } = useApplication();
  const firstTab = tabs[0];

  useHotkeys(
    [`${Key.Meta}+.`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      const isMetaKey = event.metaKey;
      switch (event.key) {
        case '.':
          if (isMetaKey) {
            setAICollapsed(!aiCollapsed);
          }
          break;
        default:
          break;
      }
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <main>
      {header}
      <div
        className="flex flex-col"
        style={{
          overflow: 'hidden',
          height: 'calc(100vh - 3.5rem)',
          width: open ? 'calc(100vw - 10.5rem)' : 'calc(100vw - 1rem)',
        }}
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            collapsible={false}
            onClick={() => {
              setActiveTab(firstTab.id);
            }}
            order={1}
            id="home"
          >
            <TabContext.Provider value={{ tabId: firstTab.id }}>
              {children}
            </TabContext.Provider>
          </ResizablePanel>
          <ResizableHandle />
          {!aiCollapsed && (
            <ResizablePanel
              collapsible={false}
              maxSize={50}
              minSize={25}
              defaultSize={size}
              onResize={(size) => setSize(size)}
              order={2}
              id="rightScreen"
              className="border-l border-border"
            >
              <AI />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </main>
  );
});
