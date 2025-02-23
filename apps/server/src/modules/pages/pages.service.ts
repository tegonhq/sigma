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
  Page,
  PageSelect,
  UpdatePageDto,
  enchancePrompt,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ContentService } from 'modules/content/content.service';
import { TransactionClient } from 'modules/tasks/tasks.utils';

import {
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
      let tasksExtensionContent = getTaskExtensionInPage(page);
      tasksExtensionContent = upsertTaskInExtension(
        tasksExtensionContent,
        taskIds,
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

    return this.prisma.page.create({
      data: {
        ...pageData,
        description: finalDescription,
        workspace: { connect: { id: workspaceId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
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

  async removeTaskFromPageByTitle(title: string, taskIds: string) {
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
}
