import { observer } from 'mobx-react-lite';

import { useRemoteComponent } from 'common/RemoteComponent';
import type { PageType, TaskType } from 'common/types';

import { StatusDropdown, StatusDropdownVariant } from './status-dropdown';

interface IntegrationTaskItemProps {
  task: TaskType;
  page: PageType;
  statusChange: (status: string) => void;
}

export const IntegrationTaskItem = observer(
  ({ task, page, statusChange }: IntegrationTaskItemProps) => {
    const url = `http://localhost:8000/local/Users/harshithmullapudi/Documents/sigma-integrations/github/dist/frontend/index.js`;
    const [loading, err, Component] = useRemoteComponent(url, 'Preview');

    if (loading) {
      return <div>Loading...</div>;
    }

    if (err) {
      return <div>Unknown Error: {err.toString()}</div>;
    }

    const statusNode = (
      <StatusDropdown
        value={task.status}
        onChange={statusChange}
        variant={StatusDropdownVariant.NO_BACKGROUND}
      />
    );

    return (
      <Component view="task" task={task} page={page} statusNode={statusNode} />
    );
  },
);
