import { ScrollArea } from '@tegonhq/ui';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useTab } from 'hooks/application/use-tab';

import { DayEditor } from './day-editor';
import { Navigation } from './navigation';

// A component to render individual date items.
export const Day = observer(() => {
  const { tab } = useTab();
  const { date = new Date() } = tab.data;

  return (
    <ScrollArea className="flex h-full justify-center w-full p-4">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-1 h-full max-w-[97ch]">
          <Navigation />

          <div className="flex flex-col ml-2">
            <h3 className="text-xl mb-2">
              {format(date, 'EEEE, MMMM do, yyyy')}
            </h3>

            <DayEditor date={date} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
