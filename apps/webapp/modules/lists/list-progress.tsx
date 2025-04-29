import { observer } from 'mobx-react-lite';
import React from 'react';

import { Progress } from 'common/progress';
import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

interface ListProgressProps {
  id: string;
  onlyGraph?: boolean;
}

export const ListProgress = observer(
  ({ id, onlyGraph = false }: ListProgressProps) => {
    const { tasksStore, listsStore } = useContextStore();
    const list = listsStore.getListWithId(id);

    const tasks = tasksStore.getTasksForList(list?.id);

    if (!list) {
      return null;
    }

    const totalCompletedTasks = tasks.filter((task: TaskType) => {
      if (task.status === 'Done' || task.status === 'Canceled') {
        return true;
      }

      return false;
    });

    const completedPercentage =
      tasks.length === 0
        ? 0
        : Math.floor((totalCompletedTasks.length / tasks.length) * 100);

    const color = React.useCallback((percentage: number) => {
      if (percentage > 10) {
        return '#3caf20';
      }
      return '#d94b0e';
    }, []);

    if (onlyGraph) {
      return (
        <div className="flex items-center gap-2">
          <Progress
            color={color(completedPercentage)}
            segments={[
              {
                value: 100,
              },
              { value: completedPercentage },
            ]}
          />
          <div className="font-mono">{totalCompletedTasks.length}</div>
        </div>
      );
    }

    return (
      <div className="pt-4 px-4 pb-0 flex w-full gap-10">
        <div className="flex flex-col grow gap-1">
          <h2>List Progress</h2>
          <Progress
            color={color(completedPercentage)}
            segments={[
              {
                value: 100,
              },
              { value: completedPercentage },
            ]}
          />
        </div>
        <div className="flex flex-col">
          <h2 className="font-mono">Scope</h2>
          <p>{tasks.length} issues </p>
        </div>

        <div className="flex flex-col">
          <h2 className="font-mono">Done</h2>
          <p>
            {completedPercentage}% ({totalCompletedTasks.length} issues)
          </p>
        </div>
      </div>
    );
  },
);
