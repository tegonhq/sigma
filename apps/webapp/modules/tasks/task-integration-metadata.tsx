import type { IntegrationDefinition } from '@sigma/types';

import { observer } from 'mobx-react-lite';
import React from 'react';

import { useRemoteComponent } from 'common/RemoteComponent';
import type {
  IntegrationAccountType,
  TaskExternalLinkType,
  TaskType,
} from 'common/types';

import { useIPC } from 'hooks/ipc';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

import { getIntegrationURL } from './utils';

export enum TaskIntegrationViewType {
  SINGLE_TASK = 'SINGLE_TASK', // Full task view with complete integration details
  TASK_LIST_ITEM = 'TASK_LIST_ITEM', // Compact view in task list/table rows
}

export const TaskIntegrationMetadata = observer(
  ({
    url,
    view,
    task,
    integrationAccount,
    taskExternalLink,
    integrationDefinition,
  }: {
    url: string;
    view: TaskIntegrationViewType;
    task: TaskType;
    taskExternalLink: TaskExternalLinkType;
    integrationAccount: IntegrationAccountType;
    integrationDefinition: IntegrationDefinition;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, _err, Component] = useRemoteComponent(url, 'TaskMetadata');

    if (loading || !Component) {
      return null;
    }

    const commonProps = {
      task,
      integrationAccount,
      integrationDefinition,
      taskExternalLink,
      view,
    };

    if (view === TaskIntegrationViewType.TASK_LIST_ITEM) {
      return <Component {...commonProps} />;
    }

    return (
      <div className="p-2 mx-2 flex gap-2 rounded bg-grayAlpha-50 items-center">
        <Component {...commonProps} />
      </div>
    );
  },
);

export const TaskIntegrationMetadataWrapper = observer(
  ({ task, view }: { task: TaskType; view: TaskIntegrationViewType }) => {
    const { taskExternalLinksStore, integrationAccountsStore } =
      useContextStore();
    const { data: integrationDefinitions, isLoading } =
      useGetIntegrationDefinitions();
    const ipc = useIPC();

    const [url, setURL] = React.useState<string>();
    const [integrationDefinition, setIntegrationDefinition] =
      React.useState<IntegrationDefinition>();

    const taskExternalLinks = taskExternalLinksStore.getExternalLinksForTask({
      taskId: task.id,
    });

    // Early return if no external links or still loading
    if (!taskExternalLinks[0] || isLoading) {
      return null;
    }

    // Get integration account and definition
    const integrationAccount = integrationAccountsStore.getAccountWithId(
      taskExternalLinks[0].integrationAccountId,
    );

    React.useEffect(() => {
      if (!integrationDefinitions) {
        return;
      }

      const definition = integrationDefinitions.find(
        (def) => integrationAccount.integrationDefinitionId === def.id,
      );
      setIntegrationDefinition(definition);
    }, [integrationDefinitions, integrationAccount?.integrationDefinitionId]);

    // Fetch URL when definition changes
    React.useEffect(() => {
      const fetchUrl = async () => {
        if (!integrationDefinition) {
          return;
        }

        const fetchedUrl = await getIntegrationURL(ipc, integrationDefinition);
        setURL(fetchedUrl);
      };

      fetchUrl();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integrationDefinition]);

    if (!integrationDefinition || !url) {
      return null;
    }

    return (
      <TaskIntegrationMetadata
        task={task}
        integrationAccount={integrationAccount}
        integrationDefinition={integrationDefinition}
        taskExternalLink={taskExternalLinks[0]}
        url={url}
        view={view}
      />
    );
  },
);
