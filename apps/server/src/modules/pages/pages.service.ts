import { TiptapTransformer } from '@hocuspocus/transformer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  convertHtmlToTiptapJson,
  convertTiptapJsonToHtml,
  tiptapExtensions,
} from '@sigma/editor-extensions';
import {
  Conversation,
  CreatePageDto,
  GetPageByTitleDto,
  LLMModelEnum,
  Page,
  UpdatePageDto,
  UserTypeEnum,
  enchancePrompt,
} from '@sigma/types';
import axios from 'axios';
import { PrismaService } from 'nestjs-prisma';
import * as Y from 'yjs';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ConversationService } from 'modules/conversation/conversation.service';
import { TransactionClient } from 'modules/tasks/tasks.utils';
import { UsersService } from 'modules/users/users.service';

import { PageSelect } from './pages.interface';

@Injectable()
export class PagesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private usersService: UsersService,
    private aiRequestService: AIRequestsService,
    private conversationService: ConversationService,
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
    // Try to find existing page
    const existingPage = await this.prisma.page.findFirst({
      where: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspaceId,
        deleted: null,
      },
      select: PageSelect,
    });

    if (existingPage) {
      if (existingPage.description) {
        const descriptionJson = JSON.parse(existingPage.description);
        existingPage.description = convertTiptapJsonToHtml(descriptionJson);
      }
      return existingPage;
    }

    // Create new page if not found
    return this.prisma.page.create({
      data: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspace: { connect: { id: workspaceId } },
        sortOrder: '',
        tags: [],
      },
      select: PageSelect,
    });
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
        await convertHtmlToTiptapJson(htmlDescription),
      );
    }

    // Initialize YDoc with existing state
    const ydoc = new Y.Doc();

    if (finalDescription) {
      // Parse the JSON description if it's a string
      const descriptionJson =
        typeof finalDescription === 'string'
          ? JSON.parse(finalDescription)
          : finalDescription;

      // Convert Tiptap JSON to YDoc
      const newYDoc = TiptapTransformer.toYdoc(
        descriptionJson,
        'default',
        tiptapExtensions,
      );
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(newYDoc));
    }

    // Get the binary state
    const binaryState = Y.encodeStateAsUpdate(ydoc);

    return prismaClient.page.update({
      where: { id: pageId },
      data: {
        ...pageData,
        description: finalDescription,
        descriptionBinary: Buffer.from(binaryState),
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

  async enhancePage(pageId: string, userId: string): Promise<Conversation> {
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

    // Create a conversation for this enhancement
    const conversation = await this.conversationService.createConversation(
      page.workspaceId,
      userId,
      {
        message: `Please create tasks along with subtasks as description in Sigma.
        ${outputContent}`,
        userType: UserTypeEnum.User,
        context: { agents: ['sigma'] },
      },
    );

    const pat = await this.usersService.getOrCreatePat(
      userId,
      page.workspaceId,
    );

    // Trigger the streaming API call without waiting for completion
    axios.post(
      `${this.configService.get('AGENT_HOST')}/chat`,
      {
        conversation_id: conversation.id,
        conversation_history_id: conversation.conversationHistory[0].id,
        workspace_id: page.workspaceId,
        stream: true,
      },
      { headers: { Authorization: `Bearer ${pat}` } },
    );

    return conversation;
  }
}
