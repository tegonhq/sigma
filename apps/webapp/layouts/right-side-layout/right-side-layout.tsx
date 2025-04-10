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

import { Conversation } from 'modules/conversation';

import { SCOPES } from 'common/shortcut-scopes';
import { useLocalCommonState } from 'common/use-local-state';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';
import { TabContext } from 'store/tab-context';

import { RightSideHeader } from './right-side-header';

interface RightSideLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export const RightSideLayout = observer(
  ({ children, header }: RightSideLayoutProps) => {
    useScope(SCOPES.AI);

    const [size, setSize] = useLocalCommonState('panelSize', 15);
    const [aiCollapsed, setAICollapsed] = React.useState(true);
    const [rightSideCollapsed, setRightSideCollapsed] = React.useState(true);
    const { open } = useSidebar();

    const { tabs } = useApplication();
    const firstTab = tabs[0];

    useHotkeys(
      [Key.Escape],
      () => {
        setRightSideCollapsed(true);
      },
      {
        scopes: [SCOPES.AI],
        enableOnFormTags: true,
        enableOnContentEditable: true,
      },
    );

    useHotkeys(
      [`${Key.Meta}+l`],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event) => {
        switch (event.key) {
          case 'l':
            if (event.metaKey) {
              if (rightSideCollapsed) {
                setRightSideCollapsed(false);
                if (aiCollapsed) {
                  setAICollapsed(false);
                }
              } else {
                onClose();
              }
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

    const onClose = () => {
      setRightSideCollapsed(true);
      setAICollapsed(true);
    };

    return (
      <main>
        <div
          className="flex flex-col"
          style={{
            overflow: 'hidden',
            height: 'calc(100vh - 1rem)',
            width: open ? 'calc(100vw - 13.5rem)' : 'calc(100vw - 1rem)',
          }}
        >
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              collapsible={false}
              className="bg-background-2 rounded-md"
              style={{
                height: 'calc(100vh - 1rem)',
              }}
              order={1}
              id="home"
            >
              {header}

              <TabContext.Provider value={{ tabId: firstTab.id }}>
                {children}
              </TabContext.Provider>
            </ResizablePanel>
            {!rightSideCollapsed && (
              <>
                <ResizableHandle className="w-2.5" />

                <ResizablePanel
                  className="bg-background-2 rounded-md"
                  collapsible={false}
                  maxSize={50}
                  minSize={25}
                  defaultSize={size}
                  onResize={(size) => setSize(size)}
                  order={2}
                  id="rightScreen"
                >
                  <RightSideHeader onClose={onClose} />
                  <Conversation />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </main>
    );
  },
);
