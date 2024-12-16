import {
  Button,
  ChevronDown,
  ChevronRight,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@tegonhq/ui';
import { Calendar } from 'lucide-react';
import React from 'react';

import type { ActivityType } from 'common/types';

import { ActivityListItem } from './activity-item';
interface ActivityGroupProps {
  activities: ActivityType[];
  date: string;
}

export const ActivityGroup = ({ activities, date }: ActivityGroupProps) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-1 items-center">
        <CollapsibleTrigger asChild>
          <Button
            className="flex items-center group w-fit rounded-2xl bg-grayAlpha-100"
            size="lg"
            variant="ghost"
          >
            <Calendar size={20} className="h-5 w-5 group-hover:hidden" />
            <div className="hidden group-hover:block">
              {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            <h3 className="pl-2">{date}</h3>
          </Button>
        </CollapsibleTrigger>

        <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
          {activities.length}
        </div>
      </div>

      <CollapsibleContent>
        {activities.map((activity: ActivityType) => (
          <div key={activity.id}>
            <ActivityListItem key={activity.id} activityId={activity.id} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
