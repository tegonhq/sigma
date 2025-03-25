import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PageTypeEnum,
  Workspace,
  WorkspaceRequestParamsDto,
} from '@tegonhq/sigma-sdk';
import { format } from 'date-fns';
import { Request, Response } from 'express';
import { PrismaService } from 'nestjs-prisma';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';

import {
  CreateInitialResourcesDto,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from './workspaces.interface';

@Injectable()
export default class WorkspacesService {
  constructor(private prisma: PrismaService) {}

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
}
