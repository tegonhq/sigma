import { observer } from 'mobx-react-lite';
import React from 'react';

import { useLocalCommonState } from 'common/use-local-state';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

import { SideTaskView } from './side-task-view';

type ViewType = 'view_screen' | 'side_view';

export interface ContextType {
  taskId?: string;
  viewType: string;
  openTask: (taskId: string, override?: boolean) => void;
  closeTaskView: () => void;
  setViewType: (viewType: ViewType) => void;
}

export const TaskViewContext = React.createContext<ContextType>(undefined);

export const TaskViewProvider = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { updateTabType } = useApplication();

    const [taskId, setTaskId] = React.useState<string | undefined>(undefined);
    const [viewType, setViewType] = useLocalCommonState(
      'view_type',
      'view_screen',
    );

    const openTask = (taskId: string, override: boolean = true) => {
      if (override) {
        updateTabType(0, TabViewType.MY_TASKS, { entityId: taskId });

        return;
      }

      if (viewType === 'side_view') {
        setTaskId(taskId);
      } else {
        updateTabType(0, TabViewType.MY_TASKS, { entityId: taskId });
      }
    };

    const closeTaskView = () => {
      setTaskId(undefined);
    };

    return (
      <TaskViewContext.Provider
        value={{ viewType, taskId, openTask, closeTaskView, setViewType }}
      >
        {taskId && <SideTaskView />}
        {children}
      </TaskViewContext.Provider>
    );
  },
);
