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
} from '@sigma/types';
import { parse } from 'date-fns';
import { PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ContentService } from 'modules/content/content.service';
import { TransactionClient } from 'modules/tasks/tasks.utils';

import {
  getOutlinksTaskId,
  getTaskExtensionInPage,
  removeTaskInExtension,
  updateTaskExtensionInPage,
  upsertTaskInExtension,
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
      let tasksExtensionContent = getTaskExtensionInPage(page);
      tasksExtensionContent = upsertTaskInExtension(
        tasksExtensionContent,
        tasks,
      );

      const description = updateTaskExtensionInPage(
        page,
        tasksExtensionContent,
      );

      // Update the page with new description in the same transaction
      await this.contentService.updateContentForDocument(
        page.id,
        JSON.parse(description),
      );
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

    let tasksExtensionContent = getTaskExtensionInPage(page);
    tasksExtensionContent = removeTaskInExtension(
      tasksExtensionContent,
      taskIds,
    );

    const pageDescription = updateTaskExtensionInPage(
      page,
      tasksExtensionContent,
    );

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
    const currentOutlinkTaskIds = getOutlinksTaskId(pageOutlinks);
    const currentTaskExtensionIds = getOutlinksTaskId(pageOutlinks, true);

    const outlinks: Outlink[] = [];
    const newOutlinkTaskIds: string[] = [];
    const taskExtensionOutlinkIndices = new Set<number>();

    // Single-pass traversal to collect outlinks and mark those in taskExtension
    const traverseDocument = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node: any,
      path: number[] = [],
      isInTaskExtension = false,
    ) => {
      // Check if we're entering a taskExtension node
      const inTaskExtension =
        isInTaskExtension || node.type === 'tasksExtension';

      // If this is a task node, create an outlink
      if (node.type === 'task' && node.attrs?.id) {
        const outlinkIndex = outlinks.length;

        // Add the outlink
        outlinks.push({
          type: OutlinkType.Task,
          id: node.attrs.id,
          position: {
            path: [...path],
          },
          // Only set taskExtension:true if this task is directly inside a taskExtension node
          taskExtension: inTaskExtension,
        });
        newOutlinkTaskIds.push(node.attrs.id);

        // If in taskExtension, mark this outlink's index
        if (inTaskExtension) {
          taskExtensionOutlinkIndices.add(outlinkIndex);
        }
      }

      // Recursively process content
      if (node.content && Array.isArray(node.content)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.content.forEach((child: any, index: number) => {
          traverseDocument(child, [...path, index], inTaskExtension);
        });
      }
    };

    // Process if content exists
    if (tiptapJson.content) {
      // Single pass traversal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tiptapJson.content.forEach((node: any, index: number) => {
        traverseDocument(node, [index], false);
      });
    }

    // Extract task IDs from taskExtension outlinks
    const taskExtensionTaskIds = new Set(
      Array.from(taskExtensionOutlinkIndices).map(
        (index) => outlinks[index].id,
      ),
    );

    const taskIdsAreEqual =
      currentOutlinkTaskIds.length === newOutlinkTaskIds.length &&
      currentOutlinkTaskIds.every((id) => newOutlinkTaskIds.includes(id));

    if (!taskIdsAreEqual) {
      // Update the page with the new outlinks
      await this.prisma.page.update({
        where: { id: pageId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          outlinks: outlinks as any,
        },
      });

      if (page.type === 'Daily') {
        // Compare current task IDs with task extension task IDs
        const removedTaskIds = currentTaskExtensionIds.filter(
          (taskId) => !taskExtensionTaskIds.has(taskId),
        );

        const addedTaskIds = Array.from(taskExtensionTaskIds).filter(
          (taskId) => !currentTaskExtensionIds.includes(taskId),
        );

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
      }
    }

    return { outlinks, taskExtensionTaskIds: Array.from(taskExtensionTaskIds) };
  }

  async handleHooks(payload: { pageId: string; changedData: JsonObject }) {
    if (payload.changedData.description) {
      await this.storeOutlinks(payload.pageId);
    }
  }
}
