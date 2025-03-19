import { useApplication } from 'hooks/application';

import { useDeleteTaskOccurrenceMutation } from 'services/task-occurrence';
import { useDeleteTaskMutation, useUpdateTaskMutation } from 'services/tasks';

export const useTaskOperations = () => {
  const { mutate: deleteTask } = useDeleteTaskMutation({});
  const { mutate: deleteTaskOccurrence } = useDeleteTaskOccurrenceMutation({});

  const { mutate: updateTask } = useUpdateTaskMutation({});
  const { clearSelectedTask } = useApplication();

  const getTaskAndOccurrence = (taskWithOccurrence: string) => {
    const taskId = taskWithOccurrence.split('__')[0];
    const taskOccurrenceId = taskWithOccurrence.split('__')[1];

    return { taskId, taskOccurrenceId };
  };

  const markComplete = (taskIds: string[]) => {
    taskIds.forEach((taskWithOccurrence: string) => {
      const { taskId, taskOccurrenceId } =
        getTaskAndOccurrence(taskWithOccurrence);
      if (taskOccurrenceId) {
      } else {
        updateTask({
          taskId,
          status: 'Done',
        });
      }
    });

    clearSelectedTask();
  };

  const deleteTasks = (taskIds: string[]) => {
    taskIds.forEach((taskWithOccurrence: string) => {
      const { taskId, taskOccurrenceId } =
        getTaskAndOccurrence(taskWithOccurrence);
      if (taskOccurrenceId) {
        deleteTaskOccurrence({
          taskOccurrenceId,
        });
      } else {
        deleteTask({
          taskId,
        });
      }
    });

    clearSelectedTask();
  };

  return { markComplete, deleteTasks };
};
