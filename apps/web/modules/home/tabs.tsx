import { AI, Inbox, IssuesLine, Button, cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

export const TITLE = {
  my_day: 'My day',
  my_pages: 'My pages',
  my_tasks: 'My tasks',
  my_events: 'My events',
};

import { useApplication } from 'hooks/application/use-application';

import { TabViewType } from 'store/application';

import { WorkspaceDropdown } from './layout/workspace-dropdown';

export const Tabs = observer(() => {
  const { updateRightScreen } = useApplication();

  return (
    <div className="flex gap-1 px-3 py-2 items-center w-full">
      <div className={cn('flex items-center ml-1')}>
        <WorkspaceDropdown />
      </div>

      <div className="title-bar-sigma h-[20px] flex-1"></div>

      <div className="flex ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateRightScreen(TabViewType.AI)}
        >
          <AI />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateRightScreen(TabViewType.MY_TASKS)}
        >
          <IssuesLine />
        </Button>
      </div>
    </div>
  );
});
