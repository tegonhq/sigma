import { BadRequestException, Injectable } from '@nestjs/common';
import { convertTiptapJsonToHtml } from '@sigma/editor-extensions';
import {
  contextPrompt,
  LLMModelEnum,
  PageTypeEnum,
  Workspace,
  WorkspaceRequestParamsDto,
} from '@tegonhq/sigma-sdk';
import { format } from 'date-fns';
import { Request, Response } from 'express';
import { PrismaService } from 'nestjs-prisma';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ContentService } from 'modules/content/content.service';
import { LoggerService } from 'modules/logger/logger.service';

import {
  CreateInitialResourcesDto,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from './workspaces.interface';
import { ListsService } from '../lists/lists.service';

@Injectable()
export default class WorkspacesService {
  private readonly logger: LoggerService = new LoggerService(
    'WorkspaceService',
  );

  constructor(
    private prisma: PrismaService,
    private listsService: ListsService,
    private aiRequestsService: AIRequestsService,
    private content: ContentService,
  ) {}

  private async createOnboardingListAndTasks(workspaceId: string) {
    // Create the onboarding list
    const list = await this.listsService.createList(workspaceId);

    // Create the onboarding page content
    const onboardingContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Welcome to Sigma 🚀' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Sigma is your all-in-one platform to manage tasks, organise notes and plan your day with the help of a built-in personal assistant.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Discover the basics' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: {},
              content: [
                {
                  type: 'text',
                  text: 'Click the checkmark to mark a task as complete',
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: {},
              content: [
                {
                  type: 'text',
                  text: "Create a new task using 'CMD + N' shortcut or type '/' in a page",
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: {},
              content: [
                {
                  type: 'text',
                  text: 'Click the task id (e.g., T-1) to view and add task details',
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: {},
              content: [
                {
                  type: 'text',
                  text: 'Create your first list by clicking the + button in the sidebar',
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: {},
              content: [
                {
                  type: 'text',
                  text: 'Create a new task and schedule a task automatically by typing phrases like "tomorrow", "on monday"',
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: {},
              content: [
                {
                  type: 'text',
                  text: 'Link an existing task to any page or to my day by typing  [[task name]] ',
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Learn more about Sigma' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'text',
                  text: 'Learn more about ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: 'https://github.com/tegonhq/sigma/wiki' },
                    },
                  ],
                  text: 'basic concepts',
                },
                {
                  type: 'text',
                  text: ' in Sigma',
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'text',
                  text: 'See all ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://github.com/tegonhq/sigma/wiki/keyboard-shortcuts',
                      },
                    },
                  ],
                  text: 'keyboard shortcuts',
                },
                {
                  type: 'text',
                  text: ' to work even faster',
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'text',
                  text: 'Join our ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: 'https://discord.gg/dVTC3BmgEq' },
                    },
                  ],
                  text: 'discord server',
                },
                {
                  type: 'text',
                  text: ' to be informed about new updates or for support',
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'text',
                  text: 'We are open-source, check out our ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: 'https://github.com/tegonhq/sigma' },
                    },
                  ],
                  text: 'github repo',
                },
                {
                  type: 'text',
                  text: ' (please give us a star as well)',
                },
              ],
            },
          ],
        },
      ],
    };

    this.content.updateContentForDocument(list.pageId, onboardingContent);

    return list;
  }

  async createInitialResources(
    userId: string,
    workspaceData: CreateInitialResourcesDto,
    res: Response,
    req: Request,
  ) {
    const existingWorkspace = await this.prisma.workspace.findFirst({
      where: { userId },
    });

    if (existingWorkspace) {
      throw new BadRequestException('Already workspace exist');
    }

    const workspace = await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          fullname: workspaceData.fullname,
        },
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceData.workspaceName,
          userId,
          slug: workspaceData.workspaceName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''),
          preferences: {
            timezone: workspaceData.timezone,
          },
          pages: {
            create: {
              title: 'Context',
              type: 'Context',
              sortOrder: '',
              description: '',
            },
          },
        },
      });

      // Create daily pages for next 7 days
      const today = new Date();
      await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const formattedDate = format(date, 'dd-MM-yyyy');

          await prisma.page.create({
            data: {
              title: formattedDate,
              type: PageTypeEnum.Daily,
              workspace: { connect: { id: workspace.id } },
              sortOrder: '',
              description: JSON.stringify({
                type: 'doc',
                content: [],
              }),
            },
          });
        }),
      );

      return workspace;
    });

    // Create onboarding list and tasks
    await this.createOnboardingListAndTasks(workspace.id);

    await Session.createNewSession(
      req,
      res,
      'public',
      supertokens.convertToRecipeUserId(userId),
    );

    res.send({ status: 200, ...workspace });
  }

  async createWorkspace(
    userId: string,
    workspaceData: CreateWorkspaceInput,
  ): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: {
        ...workspaceData,
        userId,
      },
    });

    return workspace;
  }

  async getWorkspaceBySlug(slug: string): Promise<Workspace> {
    return await this.prisma.workspace.findFirst({
      where: {
        name: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    });
  }

  async getWorkspace(
    WorkspaceIdRequestBody: WorkspaceRequestParamsDto,
  ): Promise<Workspace> {
    return await this.prisma.workspace.findUnique({
      where: {
        id: WorkspaceIdRequestBody.workspaceId,
      },
    });
  }

  async updateWorkspace(
    WorkspaceIdRequestBody: WorkspaceRequestParamsDto,
    { timezone, ...updateWorkspaceData }: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    return await this.prisma.workspace.update({
      data: {
        ...updateWorkspaceData,
        preferences: {
          timezone,
        },
      },
      where: {
        id: WorkspaceIdRequestBody.workspaceId,
      },
    });
  }

  async deleteWorkspace(
    WorkspaceIdRequestBody: WorkspaceRequestParamsDto,
  ): Promise<Workspace> {
    return await this.prisma.workspace.delete({
      where: {
        id: WorkspaceIdRequestBody.workspaceId,
      },
    });
  }

  async getRelevantContext(
    workspaceId: string,
    query: string,
    getFlag: boolean,
  ) {
    const userContextPage = await this.prisma.page.findFirst({
      where: {
        workspaceId,
        type: 'Context',
      },
    });
    const userContextPageHTML = userContextPage.description
      ? convertTiptapJsonToHtml(JSON.parse(userContextPage.description))
      : '';

    try {
      const contextResponse = await this.aiRequestsService.getLLMRequest(
        {
          messages: [
            {
              role: 'user',
              content: contextPrompt
                .replace('{{USER_PREFERENCES}}', userContextPageHTML)
                .replace('{{CURRENT_CONVERSATION_MESSAGE}}', query)
                .replace('{{GET_FLAG}}', getFlag.toString()),
            },
          ],
          llmModel: LLMModelEnum.GEMINI20FLASHLITE,
          model: 'context',
        },
        workspaceId,
      );

      const outputRegex = /<output>\s*(.*?)\s*<\/output>/s;
      const match = contextResponse.match(outputRegex);

      if (match && match[1]) {
        try {
          return JSON.parse(match[1]);
        } catch (e) {
          this.logger.error({
            message: `Failed to parse context response: ${e}`,
          });
          return [];
        }
      }
    } catch (e) {
      this.logger.error(e);
    }

    return [];
  }
}
