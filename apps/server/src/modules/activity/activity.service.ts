import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from '@redplanethq/sol-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export default class ActivityService {
  constructor(private prisma: PrismaService) {}
  async createActivity(createActivity: CreateActivityDto, workspaceId: string) {
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

    await tasks.trigger(
      'activity',
      {
        activityId,
      },
      { tags: [activityId, activity.workspaceId, activity.id] },
    );
  }
}
