import type { IntegrationDefinition } from '@sigma/types';

import {
  Button,
  ChevronDown,
  ChevronRight,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Loader,
} from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getIcon, type IconType } from 'common/icon-utils';
import type { IntegrationAccountType, TaskType } from 'common/types';
import { useLocalCommonState } from 'common/use-local-state';

import { useApplication } from 'hooks/application';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { TaskListItem } from './task-item';
import { getStatusPriority } from './utils';

interface TaskCategoryProps {
  integrationAccount: IntegrationAccountType;
}

export const TaskCategory = observer(
  ({ integrationAccount }: TaskCategoryProps) => {
    const [isOpen, setIsOpen] = useLocalCommonState(
      `${integrationAccount.id}__collapsed`,
      true,
    );
    const { tasksStore } = useContextStore();
    const { updateTabType, selectedTasks, setHoverTask } = useApplication();

    const tasks = tasksStore.getTasksWithIntegration(integrationAccount.id);
    const sortedTasks = sort(tasks).by([
      { desc: (task) => getStatusPriority(task.status) },
      { asc: (task) => new Date(task.updatedAt) },
    ]);

    const { data: integrations, isLoading } = useGetIntegrationDefinitions();

    if (isLoading) {
      return <Loader />;
    }

    const integration = integrations.find(
      (integration: IntegrationDefinition) =>
        integration.id === integrationAccount.integrationDefinitionId,
    );

    const Icon = getIcon(integration.icon as IconType);

    const taskSelect = (taskId: string) => {
      updateTabType(0, TabViewType.MY_TASKS, { entityId: taskId });
    };

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex flex-col gap-1"
      >
        <div className="flex gap-1 items-center">
          <CollapsibleTrigger asChild>
            <Button
              className="flex items-center group w-fit rounded-2xl bg-grayAlpha-100"
              size="lg"
              variant="ghost"
            >
              <Icon size={20} className="h-5 w-5 group-hover:hidden" />
              <div className="hidden group-hover:block">
                {isOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
              <h3 className="pl-2">{integration.name}</h3>
            </Button>
          </CollapsibleTrigger>

          <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
            {tasks.length}
          </div>
        </div>

        <CollapsibleContent>
          {sortedTasks.map((task: TaskType) => (
            <div
              key={task.id}
              onClick={() => taskSelect(task.id)}
              onMouseOver={() => {
                if (selectedTasks.length === 0) {
                  setHoverTask(task.id);
                }
              }}
            >
              <TaskListItem taskId={task.id} />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  },
);
