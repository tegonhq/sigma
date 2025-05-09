import { BadRequestException, Injectable } from '@nestjs/common';
import { convertTiptapJsonToHtml } from '@sigma/editor-extensions';
import {
  contextSystemPrompt,
  contextUserPrompt,
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
import { LoggerService } from 'modules/logger/logger.service';

import { OnboardingContent } from './constants';
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
  ) {}

  async createOnboardingListAndTasks(workspaceId: string) {
    // Create the onboarding list
    const list = await this.listsService.createList(
      workspaceId,
      'Getting started with Sigma',
      JSON.stringify(OnboardingContent),
    );

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

  async getRelevantContext(workspaceId: string, query: string) {
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
              role: 'system',
              content: contextSystemPrompt,
            },
            {
              role: 'user',
              content: contextUserPrompt
                .replace('{{USER_PREFERENCES}}', userContextPageHTML)
                .replace('{{CURRENT_CONVERSATION_MESSAGE}}', query),
            },
          ],
          llmModel: LLMModelEnum.GPT41MINI,
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
