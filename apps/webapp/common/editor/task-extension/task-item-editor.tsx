import { observer } from 'mobx-react-lite';

import {
  getStatusColor,
  getStatusIcon,
} from 'modules/tasks/status-dropdown/status-utils';

import { getIcon, type IconType } from 'common/icon-utils';
import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';
import { useIntegrationFromAccount } from 'hooks/integration';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

interface TaskItemProps {
  task: TaskType;
}

export const TaskItem = observer(({ task }: TaskItemProps) => {
  const { updateTabType } = useApplication();
  const { pagesStore } = useContextStore();
  const page = pagesStore.getPageWithId(task?.pageId);
  const { integration } = useIntegrationFromAccount(task?.integrationAccountId);
  const openTask = () => {
    updateTabType(1, TabViewType.MY_TASKS, task.id);
  };

  const CategoryIcon = getStatusIcon(task.status);

  const Icon = getIcon(integration?.icon as IconType);

  return (
    <a
      className="gap-1 bg-grayAlpha-100 py-0.5 px-1 rounded box-decoration-clone"
      contentEditable={false}
      onClick={openTask}
    >
      <span>
        <span className="inline-flex items-center gap-1 justify-bottom top-1 relative">
          <CategoryIcon size={18} color={getStatusColor(task.status).color} />
          {integration && <Icon size={16} />}
        </span>
      </span>
      <span className="ml-1">{page?.title}</span>
    </a>
  );
});
