import {
  Button,
  ChevronDown,
  ChevronRight,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  IssuesLine,
} from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { AddTask } from './add-task';
import { TaskListItem } from './task-item';
import { getStatusPriority } from './utils';

interface PersonalTaskCategoryProps {
  newTask: boolean;
  setNewTask: (value: boolean) => void;
}

export const PersonalTaskCategory = observer(
  ({ newTask, setNewTask }: PersonalTaskCategoryProps) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const { tasksStore } = useContextStore();
    const tasks = tasksStore.getTasksWithNoIntegration();

    const { updateTabType } = useApplication();

    const sortedTasks = sort(tasks).by([
      { desc: (task) => getStatusPriority(task.status) },
      { desc: (task) => new Date(task.updatedAt) },
    ]);

    const taskSelect = (taskId: string) => {
      updateTabType(1, TabViewType.MY_TASKS, taskId);
    };

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex flex-col gap-2"
      >
        <div className="flex gap-1 items-center">
          <CollapsibleTrigger asChild>
            <Button
              className="flex items-center group w-fit rounded-2xl bg-grayAlpha-100"
              size="lg"
              variant="ghost"
            >
              <IssuesLine size={20} className="h-5 w-5 group-hover:hidden" />
              <div className="hidden group-hover:block">
                {isOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
              <h3 className="pl-2">Personal tasks</h3>
            </Button>
          </CollapsibleTrigger>

          <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
            {sortedTasks.length}
          </div>
        </div>

        {newTask && <AddTask onCancel={() => setNewTask(false)} />}
        <CollapsibleContent>
          {sortedTasks.map((task: TaskType) => (
            <div key={task.id} onClick={() => taskSelect(task.id)}>
              <TaskListItem taskId={task.id} />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  },
);
