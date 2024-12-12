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
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getIcon, type IconType } from 'common/icon-utils';
import type { IntegrationAccountType, TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

import { TaskListItem } from './task-item';

interface TaskCategoryProps {
  integrationAccount: IntegrationAccountType;
}

export const TaskCategory = observer(
  ({ integrationAccount }: TaskCategoryProps) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const { tasksStore } = useContextStore();
    const { tabs } = useApplication();
    const secondTab = tabs[1];
    const tasks = tasksStore.getTasksWithIntegration(integrationAccount.id);

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
      secondTab.updateData({ entity_id: taskId });
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
          {tasks.map((task: TaskType) => (
            <div key={task.id} onClick={() => taskSelect(task.id)}>
              <TaskListItem taskId={task.id} />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  },
);
