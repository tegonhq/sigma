import { Button } from '@sigma/ui/components/ui/button';
import { Separator } from '@sigma/ui/components/ui/separator';
import { AI, Inbox, IssuesLine } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';

export const TITLE = {
  my_day: 'My day',
  my_pages: 'My pages',
  my_tasks: 'My tasks',
  my_events: 'My events',
};

import { useApplication } from 'hooks/application/use-application';

import { WorkspaceDropdown } from './layout/workspace-dropdown';
import { TabViewType } from 'store/application';

export const Tabs = observer(() => {
  const { updateRightScreen, rightScreenCollapsed } = useApplication();

  return (
    <div className="flex gap-1 px-3 py-2 items-center justify-between w-full">
      <div className="flex items-center">
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
