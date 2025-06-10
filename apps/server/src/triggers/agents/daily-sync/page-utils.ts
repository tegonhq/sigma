import { Page, Task } from '@redplanethq/sol-sdk';

import { getTaskItemContent } from 'modules/pages/pages.utils';

export function getTaskListsInPage(page: Page) {
  const description = page.description;

  try {
    const descriptionJson =
      typeof description === 'string' ? JSON.parse(description) : description;

    // Find all taskList nodes in the document content
    const taskLists =
      descriptionJson.content?.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => node.type === 'taskList',
      ) || [];

    return taskLists;
  } catch (error) {
    console.error('Error parsing page description:', error);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCurrentTaskIds(tiptapJson: any): string[] {
  const taskIds: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findTaskIds = (node: any) => {
    // Check if node is a task
    if (node.type === 'taskItem' && node.attrs?.id) {
      taskIds.push(node.attrs.id);
      return;
    }

    // Recursively check content array
    if (node.content && Array.isArray(node.content)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.content.forEach((child: any) => findTaskIds(child));
    }
  };

  // Start traversing from the root
  if (tiptapJson.content) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tiptapJson.content.forEach((node: any) => findTaskIds(node));
  }

  // Remove duplicates and return
  return [...new Set(taskIds)];
}

export function updateTaskListsInPage(
  page: Page,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedTaskLists: Array<Record<string, any>>,
) {
  try {
    const descriptionJson =
      typeof page.description === 'string'
        ? JSON.parse(page.description)
        : page.description || { type: 'doc', content: [] };

    // Find all taskList nodes and their indices
    const taskListIndices: number[] = [];
    descriptionJson.content?.forEach(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node: any, index: number) => {
        if (node.type === 'taskList') {
          taskListIndices.push(index);
        }
      },
    );

    // If we have existing task lists and updated task lists
    if (taskListIndices.length > 0 && updatedTaskLists.length > 0) {
      // Update the first task list
      const [firstTaskListIndex] = taskListIndices;
      const updatedTaskList = updatedTaskLists[0];
      descriptionJson.content[firstTaskListIndex] = updatedTaskList;

      // If there are additional updated task lists that don't exist in the document.
      // Used while removing a task in all task lists
      if (updatedTaskLists.length > taskListIndices.length) {
        // Add the new task lists after the last existing task list
        const insertPosition = taskListIndices[taskListIndices.length - 1] + 1;
        descriptionJson.content.splice(
          insertPosition,
          0,
          ...updatedTaskLists.slice(taskListIndices.length),
        );
      }
    } else if (updatedTaskLists.length > 0) {
      // No existing task lists, but we have updated ones to add
      // Add them at the beginning of the content
      descriptionJson.content = [
        ...updatedTaskLists,
        ...descriptionJson.content,
      ];
    }
    // If no updated task lists, we don't need to change anything
    return descriptionJson;
  } catch (error) {
    console.error('Error updating taskLists in page:', error);
    return JSON.parse(page.description);
  }
}
export function upsertTasksInPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskLists: Array<Record<string, any>>,
  tasks: Task[],
) {
  // Create a Set of existing task IDs for O(1) lookup
  const existingTaskIds = new Set(getCurrentTaskIds({ content: taskLists }));

  // Add only new tasks
  const newTasks = tasks.filter((task: Task) => !existingTaskIds.has(task.id));

  if (newTasks.length === 0) {
    return taskLists;
  }

  // Create new task list items
  const newTaskListItems = newTasks.map((task: Task) => ({
    type: 'taskItem',
    attrs: {
      id: task.id,
    },
    content: getTaskItemContent(task.page.title),
  }));

  // If there's an existing taskList, add to it, otherwise create a new one
  if (taskLists.length > 0) {
    // Add to the first taskList
    taskLists[0].content = [
      ...(taskLists[0].content || []),
      ...newTaskListItems,
    ];
  } else {
    // Create a new taskList
    taskLists.push({
      type: 'taskList',
      attrs: { class: 'task-list' },
      content: newTaskListItems,
    });
  }

  return taskLists;
}
