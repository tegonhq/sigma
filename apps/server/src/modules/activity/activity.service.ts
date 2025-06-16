import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from '@redplanethq/sol-sdk';
import { convertTiptapJsonToHtml } from '@sol/editor-extensions';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export default class ActivityService {
  constructor(private prisma: PrismaService) {}
  async createActivity(
    createActivity: CreateActivityDto,
    workspaceId: string,
    userId: string,
  ) {
    const exisitingActivity = await this.prisma.activity.findFirst({
      where: {
        AND: [
          { workspaceId },
          {
            OR: [
              createActivity.sourceURL
                ? { sourceURL: createActivity.sourceURL }
                : {},
              createActivity.taskId ? { taskId: createActivity.taskId } : {},
            ],
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        integrationAccount: {
          include: {
            integrationDefinition: true,
          },
        },
      },
    });

    console.log(exisitingActivity, userId);

    return await this.prisma.activity.create({
      data: {
        ...createActivity,
        workspaceId,
      },
    });
  }

  async runActivity(activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        workspace: true,
      },
    });
    const userContextPage = await this.prisma.page.findFirst({
      where: {
        workspaceId: activity.workspaceId,
        type: 'Context',
      },
    });

    const userContextPageHTML = userContextPage.description
      ? convertTiptapJsonToHtml(JSON.parse(userContextPage.description))
      : '';

    await tasks.trigger(
      'activity',
      {
        activityId,
        userContextPage: userContextPageHTML,
      },
      { tags: [activityId, activity.workspaceId, activity.id] },
    );
  }
}
