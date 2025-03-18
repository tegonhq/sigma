import { Injectable } from '@nestjs/common';
import {
  convertHtmlToTiptapJson,
  convertTiptapJsonToHtml,
} from '@sigma/editor-extensions';
import {
  CreatePageDto,
  EnhancePageResponse,
  GetPageByTitleDto,
  LLMModelEnum,
  OutlinkType,
  Outlink,
  Page,
  PageSelect,
  UpdatePageDto,
  enchancePrompt,
  JsonObject,
  Task,
  CreateTaskDto,
  PageTypeEnum,
} from '@sigma/types';
import { parse } from 'date-fns';
import { PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ContentService } from 'modules/content/content.service';
import { TransactionClient } from 'modules/tasks/tasks.utils';

import {
  getOutlinksTaskId,
  getTaskListsInPage,
  removeTasksFromPage,
  updateTaskListsInPage,
  upsertTasksInPage,
} from './pages.utils';

@Injectable()
export class PagesService {
  constructor(
    private prisma: PrismaService,
    private aiRequestService: AIRequestsService,
    private contentService: ContentService,
  ) {}

  async getPageByTitle(
    workspaceId: string,
    getPageByTitleDto: GetPageByTitleDto,
  ): Promise<Page> {
    const page = await this.prisma.page.findFirst({
      where: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspaceId,
        deleted: null,
      },
      select: PageSelect,
    });

    if (page?.description) {
      const descriptionJson = JSON.parse(page.description);
      page.description = convertTiptapJsonToHtml(descriptionJson);
    }

    return page;
  }

  async getOrCreatePageByTitle(
    workspaceId: string,
    getPageByTitleDto: GetPageByTitleDto,
  ): Promise<Page> {
    // Combine find and create into a single transaction if needed
    const { title, type, taskIds } = getPageByTitleDto;

    const page = await this.prisma.$transaction(async (tx) => {
      // Try to find existing page
      let page = await tx.page.findFirst({
        where: {
          title,
          type,
          workspaceId,
          deleted: null,
        },
        select: PageSelect,
      });

      if (!page) {
        // Create new page if not found
        page = await tx.page.create({
          data: {
            title,
            type,
            workspace: { connect: { id: workspaceId } },
            sortOrder: '',
            tags: [],
          },
          select: PageSelect,
        });
      }

      return page;
    });

    // Update task extensions if needed
    if (taskIds?.length > 0) {
      const tasks = await this.prisma.task.findMany({
        where: { id: { in: taskIds } },
        include: { page: true },
      });

      // Get existing task lists
      const taskLists = getTaskListsInPage(page);

      // Update task lists with new tasks
      const updatedTaskLists = upsertTasksInPage(taskLists, tasks);

      // Update the page description with the updated task lists
      const description = updateTaskListsInPage(page, updatedTaskLists);

      // Update the page with new description in the same transaction
      await this.contentService.updateContentForDocument(page.id, description);
    }

    // Convert description to HTML if it exists
    if (page.description) {
      const descriptionJson = JSON.parse(page.description);
      page.description = convertTiptapJsonToHtml(descriptionJson);
    }

    return page;
  }

  async getPage(pageId: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: {
        id: pageId,
        deleted: null,
      },
      select: PageSelect,
    });

    if (page?.description) {
      const descriptionJson = JSON.parse(page.description);
      page.description = convertTiptapJsonToHtml(descriptionJson);
    }

    return page;
  }

  async createPage(
    { parentId, description, htmlDescription, ...pageData }: CreatePageDto,
    workspaceId: string,
  ): Promise<Page> {
    let finalDescription = description;
    if (htmlDescription && !description) {
      finalDescription = JSON.stringify(
        await convertHtmlToTiptapJson(htmlDescription),
      );
    }

    const page = await this.prisma.$transaction(async (tx) => {
      // Try to find existing page
      let page = await tx.page.findFirst({
        where: {
          title: pageData.title,
          type: pageData.type,
          workspaceId,
          deleted: null,
        },
        select: PageSelect,
      });

      if (!page) {
        page = await this.prisma.page.create({
          data: {
            ...pageData,
            description: finalDescription,
            workspace: { connect: { id: workspaceId } },
            ...(parentId && { parent: { connect: { id: parentId } } }),
          },
        });
      }

      return page;
    });

    return page;
  }

  async updatePage(
    { parentId, description, htmlDescription, ...pageData }: UpdatePageDto,
    pageId: string,
    tx?: TransactionClient,
  ): Promise<Page> {
    const prismaClient = tx || this.prisma;

    let finalDescription = description;
    if (htmlDescription && !description) {
      finalDescription = JSON.stringify(
        convertHtmlToTiptapJson(htmlDescription),
      );
    }

    // Update the page with new description in the same transaction
    if (finalDescription) {
      await this.contentService.updateContentForDocument(
        pageId,
        JSON.parse(description),
      );
    }

    return prismaClient.page.update({
      where: { id: pageId },
      data: {
        ...pageData,
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
      select: PageSelect,
    });
  }

  async deletePage(pageId: string): Promise<Page> {
    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        deleted: new Date(),
      },
      select: PageSelect,
    });
  }

  async enhancePage(pageId: string): Promise<EnhancePageResponse[]> {
    // Get the existing page
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      select: PageSelect,
    });

    if (!page) {
      throw new Error('Page not found');
    }

    if (page?.description) {
      const descriptionJson = JSON.parse(page.description);
      page.description = convertTiptapJsonToHtml(descriptionJson);
    }

    const enhanceResponse = await this.aiRequestService.getLLMRequest(
      {
        messages: [
          // { role: 'user', content: enhanceExample },
          {
            role: 'user',
            content: enchancePrompt.replace('{{TASK_LIST}}', page.description),
          },
        ],
        llmModel: LLMModelEnum.CLAUDESONNET,
        model: 'enchance',
      },
      page.workspaceId,
    );

    const outputMatch = enhanceResponse.match(/<output>([\s\S]*?)<\/output>/);
    const outputContent = outputMatch ? outputMatch[1].trim() : '';
    let tasks = [];
    try {
      tasks = JSON.parse(outputContent);
      if (!Array.isArray(tasks)) {
        tasks = [];
      }
    } catch (e) {
      tasks = [];
    }

    return tasks;
  }

  async removeTaskFromPageByTitle(title: string, taskIds: string[]) {
    const page = await this.prisma.page.findFirst({
      where: { title, deleted: null },
    });

    // Remove specified tasks
    const pageDescription = removeTasksFromPage(page, taskIds);

    await this.contentService.updateContentForDocument(
      page.id,
      JSON.parse(pageDescription),
    );

    return page;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async storeOutlinks(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    const tiptapJson = JSON.parse(page.description);

    // Parse outlinks from string to JSON
    const pageOutlinks = page.outlinks ? page.outlinks : [];

    // Extract taskIds from current outlinks
    const currentTaskIds = getOutlinksTaskId(pageOutlinks);

    const outlinks: Outlink[] = [];
    const newOutlinkTaskIds: string[] = [];
    const allTaskIds = new Set<string>();

    // Single-pass traversal to collect outlinks and all task IDs
    const traverseDocument = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node: any,
      path: number[] = [],
    ) => {
      // If this is a task node, create an outlink
      if (node.type === 'taskItem' && node.attrs?.id) {
        // Add the outlink
        outlinks.push({
          type: OutlinkType.Task,
          id: node.attrs.id,
          position: {
            path: [...path],
          },
        });
        newOutlinkTaskIds.push(node.attrs.id);

        // Add all task IDs to the set regardless of location
        allTaskIds.add(node.attrs.id);
      }

      // Recursively process content
      if (node.content && Array.isArray(node.content)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.content.forEach((child: any, index: number) => {
          traverseDocument(child, [...path, index]);
        });
      }
    };

    // Process if content exists
    if (tiptapJson.content) {
      // Single pass traversal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tiptapJson.content.forEach((node: any, index: number) => {
        traverseDocument(node, [index]);
      });
    }

    const taskIdsAreEqual =
      currentTaskIds.length === newOutlinkTaskIds.length &&
      currentTaskIds.every((id) => newOutlinkTaskIds.includes(id));

    if (!taskIdsAreEqual) {
      // Update the page with the new outlinks
      await this.prisma.page.update({
        where: { id: pageId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          outlinks: outlinks as any,
        },
      });

      // Compare current task IDs with task extension task IDs
      const removedTaskIds = currentTaskIds.filter(
        (taskId) => !allTaskIds.has(taskId),
      );

      const addedTaskIds = Array.from(allTaskIds).filter(
        (taskId) => !currentTaskIds.includes(taskId),
      );

      if (page.type === 'Daily') {
        if (removedTaskIds.length) {
          await this.prisma.taskOccurrence.updateMany({
            where: {
              taskId: { in: removedTaskIds },
              pageId,
            },
            data: { deleted: new Date().toISOString() },
          });
        }

        if (addedTaskIds.length) {
          const pageDate = parse(page.title, 'dd-MM-yyyy', new Date());

          const startTime = new Date(pageDate);
          startTime.setHours(0, 0, 0, 0);

          const endTime = new Date(pageDate);
          endTime.setHours(23, 59, 59, 999);

          await Promise.all(
            addedTaskIds.map((taskId) =>
              this.prisma.taskOccurrence.upsert({
                where: {
                  taskId_pageId: {
                    taskId,
                    pageId,
                  },
                },
                create: {
                  taskId,
                  pageId,
                  workspaceId: page.workspaceId,
                  startTime,
                  endTime,
                  status: 'Todo',
                },
                update: {
                  deleted: null,
                },
              }),
            ),
          );
        }
      } else if (page.type === 'List') {
        const list = await this.prisma.list.findFirst({
          where: { pageId: page.id, deleted: null },
        });
        if (addedTaskIds.length) {
          await this.prisma.task.updateMany({
            where: {
              id: { in: addedTaskIds },
              deleted: null,
            },
            data: {
              listId: list.id,
            },
          });
        }

        if (removedTaskIds.length) {
          const tasksToCheck = await this.prisma.task.findMany({
            where: { id: { in: removedTaskIds } },
            select: { id: true, source: true },
          });

          // Filter tasks that need to be deleted
          const tasksToDelete = tasksToCheck
            .filter(
              (task) =>
                task.source &&
                typeof task.source === 'object' &&
                'id' in task.source &&
                task.source.id === list.id,
            )
            .map((task) => task.id);

          // Delete in a single batch operation
          if (tasksToDelete.length) {
            await this.prisma.task.updateMany({
              where: { id: { in: tasksToDelete } },
              data: { deleted: new Date().toISOString() },
            });
          }
        }
      } else if (page.type === 'Default') {
        const pageTask = await this.prisma.task.findFirst({
          where: { pageId: page.id, deleted: null },
        });
        if (addedTaskIds.length) {
          await this.prisma.task.updateMany({
            where: {
              id: { in: addedTaskIds },
              deleted: null,
            },
            data: {
              parentId: pageTask.id,
            },
          });
        }

        if (removedTaskIds.length) {
          const tasksToCheck = await this.prisma.task.findMany({
            where: { id: { in: removedTaskIds } },
            select: { id: true, source: true },
          });

          // Filter tasks that need to be deleted
          const tasksToDelete = tasksToCheck
            .filter(
              (task) =>
                task.source &&
                typeof task.source === 'object' &&
                'id' in task.source &&
                task.source.id === pageTask.id,
            )
            .map((task) => task.id);

          // Delete in a single batch operation
          if (tasksToDelete.length) {
            await this.prisma.task.updateMany({
              where: { id: { in: tasksToDelete } },
              data: { deleted: new Date().toISOString() },
            });
          }
        }
      }
    }

    return { outlinks, allTaskIds };
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
  ): Promise<Task> {
    const prismaClient = this.prisma;
    const {
      title,
      metadata,
      status: taskStatus,
      source,
      integrationAccountId,
      listId,
      pageDescription,
      parentId,
      ...otherTaskData
    } = createTaskDto;

    // For a page if there exisiting an already deleted task with the same title
    // use that instead of creating a new one
    const exisitingTask = await prismaClient.task.findMany({
      where: {
        deleted: { not: null },
        page: {
          title,
        },
      },
    });

    if (exisitingTask.length > 0 && exisitingTask[0]) {
      const task = await prismaClient.task.update({
        where: {
          id: exisitingTask[0].id,
        },
        data: {
          deleted: null,
          source: source ? { ...source } : undefined,
        },
        include: {
          page: true,
        },
      });

      return task;
    }

    // Create the task first
    const task = await prismaClient.task.create({
      data: {
        status: taskStatus || 'Todo',
        metadata,
        ...otherTaskData,
        workspace: { connect: { id: workspaceId } },
        ...(listId && {
          list: { connect: { id: listId } },
        }),
        ...(parentId && { parent: { connect: { id: parentId } } }),
        page: {
          create: {
            title,
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.Default,
            workspace: { connect: { id: workspaceId } },
          },
        },
        source: source ? { ...source } : undefined,
      },
      include: {
        page: true,
      },
    });

    return task;
  }

  async createTasks(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    const tiptapJson = JSON.parse(page.description);
    let tasksCreated = false;

    const getTitle = (node: any) => {
      try {
        return node.content[0].content[0].text;
      } catch (e) {
        return '';
      }
    };

    // Single-pass traversal to collect outlinks and all task IDs
    const traverseDocument = async (node: any, path: number[] = []) => {
      // If this is a task node without an ID, create a task
      if (node.type === 'taskItem' && !node.attrs?.id) {
        const title = getTitle(node);

        if (title) {
          const task = await this.createTask(
            { title, status: 'Todo' },
            page.workspaceId,
          );
          // Add the task ID to the node attributes
          node.attrs = { ...node.attrs, id: task.id };
          tasksCreated = true;
        }
      }

      // Recursively process content
      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          await traverseDocument(child, [...path]);
        }
      }
    };

    // Process if content exists
    if (tiptapJson.content) {
      // Process nodes sequentially to maintain order
      for (const node of tiptapJson.content) {
        await traverseDocument(node);
      }
    }

    // Update the page with the modified JSON that now includes task IDs
    // Only update the page if we actually created new tasks
    if (tasksCreated) {
      await this.contentService.updateContentForDocument(pageId, tiptapJson);
    }
    return tiptapJson;
  }

  async handleHooks(payload: { pageId: string; changedData: JsonObject }) {
    if (payload.changedData.description) {
      await this.createTasks(payload.pageId);
      await this.storeOutlinks(payload.pageId);
    }
  }
}
