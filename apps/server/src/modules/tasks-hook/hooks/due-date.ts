import { PageTypeEnum, Task } from '@sigma/types';
import { format } from 'date-fns';

import { ContentService } from 'modules/content/content.service';
import { PagesService } from 'modules/pages/pages.service';
import {
  getTaskExtensionInPage,
  removeTaskInExtension,
  updateTaskExtensionInPage,
} from 'modules/pages/pages.utils';

export async function addTaskToDatePage(
  pagesService: PagesService,
  task: Task,
) {
  const formattedDate = format(task.dueDate, 'dd-MM-yyyy');

  const page = await pagesService.getOrCreatePageByTitle(task.workspaceId, {
    title: formattedDate,
    type: PageTypeEnum.Daily,
    taskIds: [task.id],
  });

  return page;
}

export async function removeTaskFromDatePage(
  pagesService: PagesService,
  contentService: ContentService,
  task: Task,
) {
  const formattedDate = format(task.dueDate, 'dd-MM-yyyy');

  const page = await pagesService.getOrCreatePageByTitle(task.workspaceId, {
    title: formattedDate,
    type: PageTypeEnum.Daily,
  });

  let taskExtensions = getTaskExtensionInPage(page);

  taskExtensions = removeTaskInExtension(taskExtensions, task.id);
  const pageDescription = updateTaskExtensionInPage(page, taskExtensions);

  return await contentService.updateContentForDocument(
    page.id,
    pageDescription,
  );
}
