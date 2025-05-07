import { Badge, cn } from '@tegonhq/ui';

import { getIcon, type IconType } from 'common/icon-utils';
import type { TaskType } from 'common/types';

import { useIPC } from 'hooks/ipc';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

export enum TaskExternalVariant {
  DEFAULT = 'DEFAULT',
  SHORT = 'SHORT',
}

interface TaskExternalInfoProps {
  task: TaskType;
  variant?: TaskExternalVariant;
}

export const TaskExternalInfo = ({
  task,
  variant = TaskExternalVariant.DEFAULT,
}: TaskExternalInfoProps) => {
  const { integrationAccountsStore, taskExternalLinksStore } =
    useContextStore();
  const ipc = useIPC();

  const taskExternalLinks = taskExternalLinksStore.getExternalLinksForTask({
    taskId: task.id,
  });

  const firstExternalLink = taskExternalLinks[0];

  const integrationAccount = integrationAccountsStore.getAccountWithId(
    firstExternalLink?.integrationAccountId,
  );
  const { data: integrationDefinitions } = useGetIntegrationDefinitions();
  const integrationDefinition =
    integrationDefinitions &&
    integrationDefinitions.find(
      (integrationDefinition) =>
        integrationDefinition.id ===
        integrationAccount?.integrationDefinitionId,
    );

  if (!firstExternalLink || !integrationDefinition) {
    return null;
  }

  const Icon = getIcon(integrationDefinition.icon as IconType);

  const onClick = () => {
    if (ipc) {
      ipc.openUrl(firstExternalLink.url);
    } else {
      window.open(firstExternalLink.url, '_blank');
    }
  };

  if (variant === TaskExternalVariant.DEFAULT) {
    return (
      <Badge
        variant="secondary"
        className={cn('flex items-center gap-1 h-7 px-2 text-base')}
        onClick={onClick}
      >
        <Icon size={16} className="dark:text-background" />
        <span>{integrationDefinition.name}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn('flex items-center gap-1')}
      onClick={onClick}
    >
      <Icon size={16} className="dark:text-background" onClick={onClick} />
    </Badge>
  );
};
