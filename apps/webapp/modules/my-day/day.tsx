import { AI, ScrollArea } from '@tegonhq/ui';
import { format, isBefore, isToday } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useTab } from 'hooks/application/use-tab';

import { DayEditor } from './day-editor';
import { Navigation } from './navigation';
import { Tasks } from './tasks';
import type { TasksStoreType } from 'store/tasks';
import { useContextStore } from 'store/global-context-provider';

function getTasks(tasksStore: TasksStoreType, date: Date) {
  const today = new Date();

  if (isToday(date)) {
    return tasksStore.getTasksForToday();
  } else if (isBefore(date, today)) {
    return tasksStore.getCompletedTasksForDate(date);
  }

  return tasksStore.getTasksForDate(date);
}

// A component to render individual date items.
export const Day = observer(() => {
  const { tab } = useTab();
  const { date = new Date() } = tab.data;
  const { tasksStore } = useContextStore();

  return (
    <ScrollArea className="flex h-full justify-center w-full p-4">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-1 h-full max-w-[97ch]">
          <Navigation />

          <div className="flex flex-col ml-2 grow">
            <h3 className="text-xl mb-2 flex gap-1">
              {format(date, 'EEEE, MMMM do, yyyy')}
              <AI />
            </h3>

            <h3 className="text-muted-foreground font-medium">Notes</h3>
            <DayEditor date={date} />

            <Tasks date={date} tasks={getTasks(tasksStore, date)} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
