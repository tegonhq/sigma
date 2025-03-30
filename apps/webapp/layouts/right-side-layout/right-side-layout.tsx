import {
  Button,
  IssuesLine,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useSidebar,
} from '@tegonhq/ui';
import { AI as AIIcon } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { AI } from 'modules/ai';
import { SingleTaskWithoutLayout } from 'modules/tasks/single-task';

import { Shortcut } from 'common/shortcut';
import { SCOPES } from 'common/shortcut-scopes';
import { useLocalCommonState } from 'common/use-local-state';
import { TaskViewContext } from 'layouts/side-task-view';

import { useApplication } from 'hooks/application';

import { TabContext } from 'store/tab-context';

import { RightSideHeader } from './right-side-header';

interface RightSideLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export const RightSideLayout = observer(
  ({ children, header }: RightSideLayoutProps) => {
    const [size, setSize] = useLocalCommonState('panelSize', 15);
    const [aiCollapsed, setAICollapsed] = React.useState(true);
    const [rightSideCollapsed, setRightSideCollapsed] = React.useState(true);
    const { open } = useSidebar();
    const { taskId, closeTaskView } = React.useContext(TaskViewContext);

    const { tabs } = useApplication();
    const firstTab = tabs[0];

    useHotkeys(
      [`${Key.Meta}+l`, 'c', 't'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event) => {
        switch (event.key) {
          case 'l':
            if (event.metaKey) {
              if (rightSideCollapsed) {
                setRightSideCollapsed(false);
              } else {
                onClose();
              }
            }
            break;
          case 'c':
            if (aiCollapsed) {
              event.preventDefault();
              setAICollapsed(false);
            }
            break;
          case 't':
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

    React.useEffect(() => {
      if (taskId) {
        setRightSideCollapsed(false);
      }
    }, [taskId]);

    const getComponent = () => {
      if (!aiCollapsed) {
        return <AI />;
      }

      if (taskId) {
        return (
          <>
            <SingleTaskWithoutLayout index={0} taskId={taskId} />
          </>
        );
      }

      return (
        <div className="flex flex-col h-full justify-center items-center gap-2">
          <Button variant="secondary" className="flex gap-1">
            <AIIcon size={14} />
            Start AI chat
            <Shortcut shortcut="C" className="font-mono text-base" />
          </Button>

          <Button variant="secondary" className="flex gap-1 items-center">
            <IssuesLine size={14} />
            Open task
            <Shortcut shortcut="T" className="font-mono text-base" />
          </Button>
        </div>
      );
    };

    const onClose = () => {
      setRightSideCollapsed(true);
      setAICollapsed(true);
      closeTaskView();
    };

    return (
      <main>
        <div
          className="flex flex-col"
          style={{
            overflow: 'hidden',
            height: 'calc(100vh - 1rem)',
            width: open ? 'calc(100vw - 10.5rem)' : 'calc(100vw - 1rem)',
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
                <ResizableHandle className="w-3" />

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
                  <RightSideHeader taskId={taskId} onClose={onClose} />
                  {getComponent()}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </main>
    );
  },
);
