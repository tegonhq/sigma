import { AI, Inbox, IssuesLine, Separator, Button, cn } from '@tegonhq/ui';
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
import { useWindowState } from './use-window-state';

export const Tabs = observer(() => {
  const { updateRightScreen } = useApplication();
  const minimised = useWindowState();

  return (
    <div className="flex gap-1 px-3 py-2 items-center w-full">
      <div className={cn('flex items-center', minimised ? 'ml-14' : 'ml-2')}>
        <WorkspaceDropdown />

        <Separator orientation="vertical" className="h-[20px] mr-2" />
        <div className="flex gap-0.5 items-center">
          <Button variant="secondary" size="sm" isActive>
            My day
          </Button>
          <Button variant="secondary" size="sm">
            Instructions
          </Button>
        </div>
      </div>

      <div className="title-bar-sigma h-[20px] flex-1"></div>

      <div className="flex ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateRightScreen(TabViewType.ACTIVITY)}
        >
          <Inbox />
        </Button>
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
