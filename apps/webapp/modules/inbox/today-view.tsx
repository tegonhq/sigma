import { observer } from 'mobx-react-lite';

import { TaskListItem } from 'modules/tasks/task-item';

interface TodayViewProps {
  taskIds: string[];
}

export const TodayView = observer(({ taskIds }: TodayViewProps) => {
  return (
    <div className="flex flex-col mt-10">
      <h3 className="text-muted-foreground mb-1"> Today tasks </h3>

      {taskIds.map((taskId, index) => (
        <TaskListItem taskId={taskId} key={index} minimal />
      ))}
    </div>
  );
});
