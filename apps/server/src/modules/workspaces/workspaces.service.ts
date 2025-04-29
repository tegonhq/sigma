import { BadRequestException, Injectable } from '@nestjs/common';
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

import {
  CreateInitialResourcesDto,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from './workspaces.interface';

@Injectable()
export default class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private aiRequestsService: AIRequestsService,
  ) {}

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
    worskspaceId: string,
    query: string,
    getFlag: boolean,
  ) {
    const contextResponse = await this.aiRequestsService.getLLMRequest(
      {
        messages: [
          {
            role: 'user',
            content: contextPrompt
              .replace(
                '{{USER_PREFERENCES}}',
                `Slack-based
"When a message is posted in #priority-tasks containing the word 'urgent', create a task and fetch related Sentry errors for the linked issue ID."

Email-based
"If I receive an email from design@client.com, create a task under the 'Client Review' project and add a due date 3 days later."

Information extraction
"If someone in a conversation mentions my role or job title, extract and save it in my profile."

Mixed automation
"When a GitHub PR is linked in Slack and mentions a ticket ID, comment on the ticket with the PR link and mark the ticket as 'In Review'."

AI suggestions
"When an email contains a meeting summary or an action point, convert the summary to a checklist task."

Github
"When a new issue is created, create a new task and add to relevant list"`,
              )
              .replace('{{CURRENT_CONVERSATION_MESSAGE}}', query)
              .replace('{{GET_FLAG}}', getFlag.toString()),
          },
        ],
        llmModel: LLMModelEnum.GEMINI25FLASH,
        model: 'context',
      },
      worskspaceId,
    );

    const outputRegex = /<output>\s*(.*?)\s*<\/output>/s;
    const match = contextResponse.match(outputRegex);

    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.error('Failed to parse context response:', e);
        return [];
      }
    }

    return [];
  }
}
