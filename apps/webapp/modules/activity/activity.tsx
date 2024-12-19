import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

import { ActivityGroup } from './activity-group';
import { groupActivities } from './utils';

export const Activity = observer(() => {
  const { activityStore } = useContextStore();
  const activities = groupActivities(activityStore.activities);

  return (
    <ScrollArea className="w-full h-full p-4" id="activity-list">
      <div className="flex justify-between pb-4 items-center">
        <h2 className="text-lg"> Activity</h2>
      </div>

      <div className="flex flex-col gap-4">
        {Object.keys(activities).map((date: string) => {
          return (
            <ActivityGroup
              key={date}
              date={date}
              activities={activities[date]}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
});
