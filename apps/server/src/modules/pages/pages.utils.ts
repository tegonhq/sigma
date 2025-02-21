import { Page } from '@sigma/types';

export function getTaskExtensionInPage(page: Page) {
  const description = page.description;

  try {
    const descriptionJson =
      typeof description === 'string' ? JSON.parse(description) : description;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tasksExtension: any = {
      type: 'tasksExtension',
      content: [],
    };

    if (descriptionJson) {
      // Find the tasksExtension node in the document content
      tasksExtension = descriptionJson.content?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => node.type === 'tasksExtension',
      );
    }

    return tasksExtension;
  } catch (error) {
    console.error('Error parsing page description:', error);
    return null;
  }
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
  taskId: string,
) {
  // Check if task already exists in the extension
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskExists = taskExtensions.content?.some((node: any) => {
    if (node.type === 'paragraph' && node.content?.[0]?.type === 'task') {
      return node.content[0].attrs.id === taskId;
    }
    return false;
  });

  if (!taskExists) {
    // Add new task node if it doesn't exist
    const newTaskNode = {
      type: 'paragraph',
      content: [
        {
          type: 'task',
          attrs: {
            id: taskId,
          },
        },
      ],
    };

    // Add the new task node to content array
    if (!taskExtensions.content) {
      taskExtensions.content = [];
    }
    taskExtensions.content.push(newTaskNode);

    // Ensure there's always an empty paragraph at the end
    if (
      !taskExtensions.content.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) =>
          node.type === 'paragraph' &&
          (!node.content || node.content.length === 0),
      )
    ) {
      taskExtensions.content.push({ type: 'paragraph' });
    }
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

  // Filter out the task node with matching taskId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskExtensions.content = taskExtensions.content.filter((node: any) => {
    if (node.type === 'paragraph' && node.content?.[0]?.type === 'task') {
      return node.content[0].attrs.id !== taskId;
    }
    return true;
  });

  // Ensure there's always an empty paragraph at the end if content exists
  if (
    taskExtensions.content.length > 0 &&
    !taskExtensions.content.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node: any) =>
        node.type === 'paragraph' &&
        (!node.content || node.content.length === 0),
    )
  ) {
    taskExtensions.content.push({ type: 'paragraph' });
  }

  return taskExtensions;
}
