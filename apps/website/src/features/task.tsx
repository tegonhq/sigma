import { IssuesLine } from '@tegonhq/ui';

import { TaskItemBig } from '../components/utils';

export const Tasks = () => {
  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
        Tasks and notes
      </h3>
      <p className="text-base text-muted-foreground text-left">
        Capture tasks and notes together in the same space—no tab-hopping.
      </p>

      <div className="flex flex-col mt-1 -ml-2 gap-1">
        <TaskItemBig
          title="Ordered/unordered list when selected in a page to
                      convert to task should get converted to task"
          number="12"
          checked
        />

        <TaskItemBig title="Feat: Daily Sync" number="26" />

        <TaskItemBig title="Improve: Task extension in pages" number="41" />
      </div>
    </div>
  );
};
