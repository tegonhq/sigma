import { cn } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { type ActivityRow } from './use-activities';

interface ActivityItemProps {
  activity: ActivityRow;
  selected: boolean;
  onSelect: () => void;
}

export const ActivityItem = observer(
  ({ activity, selected, onSelect }: ActivityItemProps) => {
    return (
      <div
        className={cn(
          'mx-2 px-3 mb-0.5 mb-0.5 flex gap-1 items-center hover:bg-grayAlpha-100 rounded',
          selected && 'bg-grayAlpha-200',
        )}
        onClick={onSelect}
      >
        <div className={cn('flex flex-col gap-1 py-1.5 w-full')}>
          <div className={cn('w-[calc(100%_-_25px)]')}>
            <div className="truncate">
              {activity.data.rowType === 'conversation'
                ? activity.data.item.title
                : activity.data.item.title}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
