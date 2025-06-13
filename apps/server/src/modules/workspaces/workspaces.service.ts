import { BadRequestException, Injectable } from '@nestjs/common';
import { Workspace, WorkspaceRequestParamsDto } from '@redplanethq/sol-sdk';
import { schedules } from '@trigger.dev/sdk/v3';
import { Request, Response } from 'express';
import { PrismaService } from 'nestjs-prisma';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';

import { OnboardingContent } from './constants';
import {
  CreateInitialResourcesDto,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from './workspaces.interface';
import { ListsService } from '../lists/lists.service';

@Injectable()
export default class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private listsService: ListsService,
  ) {}

  async createOnboardingListAndTasks(workspaceId: string) {
    // Create the onboarding list
    const list = await this.listsService.createList(
      workspaceId,
      'Getting started with Sol',
      true,
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

  async toggleSync(workspaceId: string, value: boolean) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scheduleId = (workspace.preferences as any).scheduleId;

      if (scheduleId) {
        await schedules.del(scheduleId);
      }

      return;
    }

    // This moved yesterday's tasks to today
    const createdRunSchedule = await schedules.create({
      // The id of the scheduled task you want to attach to.
      task: 'daily-run-schedule',
      // The schedule in cron format - runs at midnight (00:00)
      cron: '0 0 * * *',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timezone: (workspace.preferences as any).timezone,
      // this is required, it prevents you from creating duplicate schedules. It will update the schedule if it already exists.
      deduplicationKey: workspace.id,
      externalId: workspace.id,
    });

    await this.prisma.workspace.update({
      where: {
        id: workspace.id,
      },
      data: {
        preferences: {
          ...(workspace.preferences as Record<string, string>),
          scheduleId: createdRunSchedule.id,
        },
      },
    });
  }
}
