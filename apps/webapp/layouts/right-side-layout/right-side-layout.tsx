import {
  AI,
  Button,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { Conversation } from 'modules/conversation';
import { SearchDialog } from 'modules/search';

import { SCOPES } from 'common/shortcut-scopes';
import { useLocalCommonState } from 'common/use-local-state';

import { useApplication } from 'hooks/application';
import { useScope } from 'hooks/use-scope';

import { TabViewType } from 'store/application';
import { TabContext } from 'store/tab-context';

import { RightSideHeader } from './right-side-header';

interface RightSideLayoutProps {
  children: React.ReactNode;
}

export interface ContextType {
  collapsed: boolean;
  onOpen: (defaultValue: string) => void;
  onClose: () => void;
}

export const RightSideViewContext = React.createContext<ContextType>(undefined);

export const RightSideLayout = observer(
  ({ children }: RightSideLayoutProps) => {
    useScope(SCOPES.AI);

    const [size, setSize] = useLocalCommonState('panelSize', 15);
    const [defaultValue, setDefaultValue] = React.useState(undefined);
    const [rightSideCollapsed, setRightSideCollapsed] = React.useState(true);

    const { activeTab } = useApplication();

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
            if (activeTab.type === TabViewType.ASSISTANT) {
              return;
            }

            if (event.metaKey) {
              if (rightSideCollapsed) {
                setRightSideCollapsed(false);
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
      setDefaultValue(undefined);
    };

    const onOpen = (value: string) => {
      setRightSideCollapsed(false);
      setDefaultValue(value);
    };

    return (
      <RightSideViewContext.Provider
        value={{
          collapsed: rightSideCollapsed,
          onOpen,
          onClose,
        }}
      >
        <div
          className="flex flex-col p-2 pt-0 rounded-md"
          style={{
            overflow: 'hidden',
            height: 'calc(100vh - 48px)',
          }}
        >
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              collapsible={false}
              className="bg-background-2 rounded-md"
              style={{
                height: 'calc(100vh - 56px)',
              }}
              order={1}
              id="home"
            >
              <TabContext.Provider value={{ tabId: activeTab.id }}>
                {children}
              </TabContext.Provider>
            </ResizablePanel>
            {!rightSideCollapsed && (
              <>
                <ResizableHandle className="w-2.5" />

                <ResizablePanel
                  className="rounded-md"
                  collapsible={false}
                  maxSize={50}
                  minSize={25}
                  defaultSize={size}
                  onResize={(size) => setSize(size)}
                  order={2}
                  id="rightScreen"
                >
                  <RightSideHeader onClose={onClose} />
                  <Conversation defaultValue={defaultValue} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        <SearchDialog />
        {rightSideCollapsed && activeTab.type !== TabViewType.ASSISTANT && (
          <Button
            className="fixed bottom-4 right-4 gap-2 bg-background"
            size="lg"
            variant="secondary"
            onClick={() => setRightSideCollapsed(false)}
          >
            <AI />
            Chat
          </Button>
        )}
      </RightSideViewContext.Provider>
    );
  },
);
