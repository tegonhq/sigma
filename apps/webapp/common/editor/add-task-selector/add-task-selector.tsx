import { useEditor } from 'common/editor';

import type { TaskType } from 'common/types';

import { useCreateTaskMutation } from 'services/tasks';

import { TaskSelector, type TaskContent } from './task-selector';

export const AddTaskSelector = () => {
  const { editor } = useEditor();
  const { mutate: createTask } = useCreateTaskMutation({});

  const onCreateIssues = (taskContents: TaskContent[]) => {
    taskContents.forEach((taskContent) => {
      createTask(
        {
          title: taskContent.text,
          status: 'Todo',
        },
        {
          onSuccess: (task: TaskType) => {
            const id = task.id;

            editor
              .chain()
              .focus()
              .insertContentAt(
                {
                  from: taskContent.start,
                  to: taskContent.end,
                },
                {
                  type: 'taskExtension',
                  attrs: {
                    id,
                  },
                },
              )
              .run();
          },
        },
      );
    });
  };

  return <TaskSelector onCreate={onCreateIssues} />;
};
