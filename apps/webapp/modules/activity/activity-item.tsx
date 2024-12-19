import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useContextStore } from 'store/global-context-provider';

interface ActivityListItemProps {
  activityId: string;
}

export const ActivityListItem = observer(
  ({ activityId }: ActivityListItemProps) => {
    const { activityStore } = useContextStore();

    const activity = activityStore.getActivityWithId(activityId);

    return (
      <div className="pl-1 flex group cursor-default gap-2">
        <div className="w-full flex items-center">
          <div
            className={cn(
              'flex grow items-start gap-2 pl-2 ml-1 pr-2 group-hover:bg-grayAlpha-100 rounded-xl shrink min-w-[0px]',
            )}
          >
            <div className="pt-2.5 shrink-0"></div>

            <div
              className={cn(
                'flex flex-col w-full py-2.5 border-b border-border shrink min-w-[0px]',
              )}
            >
              <div className="flex w-full justify-between gap-4">
                <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
                  <div className="text-left truncate">{activity?.name}</div>
                </div>

                <div className="flex items-center gap-2 flex-wrap pr-1 shrink-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
