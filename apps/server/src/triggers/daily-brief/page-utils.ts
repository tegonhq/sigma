import { Page, Task } from '@sigma/types';

export function getTaskExtensionInPage(page: Page) {
  const description = page.description;

  try {
    const descriptionJson =
      typeof description === 'string' ? JSON.parse(description) : description;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tasksExtension: any;

    if (descriptionJson) {
      // Find the tasksExtension node in the document content
      tasksExtension = descriptionJson.content?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => node.type === 'tasksExtension',
      );
    }
    if (!tasksExtension) {
      tasksExtension = {
        type: 'tasksExtension',
        content: [],
      };
    }

    return tasksExtension;
  } catch (error) {
    console.error('Error parsing page description:', error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCurrentTaskIds(tiptapJson: any): string[] {
  const taskIds: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findTaskIds = (node: any) => {
    // Check if node is a task
    if (node.type === 'task' && node.attrs?.id) {
      taskIds.push(node.attrs.id);
      return;
    }

    // Recursively check content array
    if (node.content && Array.isArray(node.content)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.content.forEach((child: any) => findTaskIds(child));
    }

    // For tasksExtension, check all bulletLists
    if (node.type === 'tasksExtension') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.content?.forEach((child: any) => {
        if (child.type === 'bulletList') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          child.content?.forEach((listItem: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listItem.content?.forEach((taskNode: any) => {
              if (taskNode.type === 'task' && taskNode.attrs?.id) {
                taskIds.push(taskNode.attrs.id);
              }
            });
          });
        }
      });
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

export function updateTaskExtensionInPage(
  page: Page,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskExtensionJson: Record<string, any>,
) {
  try {
    const descriptionJson =
      typeof page.description === 'string'
        ? JSON.parse(page.description)
        : page.description || { type: 'doc', content: [] };

    // Find the index of existing tasksExtension node
    const taskExtensionIndex = descriptionJson.content?.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node: any) => node.type === 'tasksExtension',
    );

    // If tasksExtension exists, update it
    if (taskExtensionIndex !== -1) {
      descriptionJson.content[taskExtensionIndex] = taskExtensionJson;
    } else {
      // If it doesn't exist, add it at the beginning
      descriptionJson.content = [
        taskExtensionJson,
        ...(descriptionJson.content || []),
      ];
    }

    return JSON.stringify(descriptionJson);
  } catch (error) {
    console.error('Error updating taskExtension in page:', error);
    return page.description;
  }
}

export function upsertTaskInExtension(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskExtensions: Record<string, any>,
  tasks: Task[],
) {
  // Initialize content array if it doesn't exist
  if (!taskExtensions.content) {
    taskExtensions.content = [];
  }

  // Create a Set of existing task IDs for O(1) lookup
  const existingTaskIds = new Set(getCurrentTaskIds(taskExtensions));

  // Add only new tasks
  const newTasks = tasks.filter((task: Task) => !existingTaskIds.has(task.id));

  if (newTasks.length > 0) {
    const newTaskNodes = newTasks.map((task: Task) => ({
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'task',
              attrs: {
                id: task.id,
              },
              content: [
                {
                  type: 'text',
                  text: task.page.title,
                },
              ],
            },
          ],
        },
      ],
    }));

    taskExtensions.content.push(...newTaskNodes);
  }

  return taskExtensions;
}

export function removeTaskInExtension(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskExtensions: Record<string, any>,
  taskId: string,
) {
  if (!taskExtensions.content) {
    return taskExtensions;
  }

  // Filter bulletLists and their content
  taskExtensions.content = taskExtensions.content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((node: any) => {
      if (node.type === 'bulletList') {
        return {
          ...node,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: node.content?.filter((listItem: any) => {
            const taskNode = listItem.content?.[0];
            return !(
              taskNode?.type === 'task' && taskNode.attrs?.id === taskId
            );
          }),
        };
      }
      return node;
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((node: any) => {
      // Remove empty bulletLists
      if (node.type === 'bulletList') {
        return node.content && node.content.length > 0;
      }
      return true;
    });

  return taskExtensions;
}
