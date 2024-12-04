import { Injectable } from '@nestjs/common';
import { Activity, CreateActivityDto } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { LoggerService } from 'modules/logger/logger.service';

@Injectable()
export default class ActivityService {
  private readonly logger: LoggerService = new LoggerService('ActivityService');

  constructor(private prisma: PrismaService) {}

  async createActivity(workspaceId: string, activityDto: CreateActivityDto) {
    this.logger.log({
      message: `Creating activity for ${activityDto.type}`,
      where: `ActivityService.createActivity`,
    });

    return await this.prisma.activity.create({
      data: { ...activityDto, workspaceId },
    });
  }

  async activityHandler(activity: Activity) {
    this.logger.log({
      message: `Handling activity ${activity.type}`,
      where: 'ActivityService.activityHandler',
    });

    try {
      // Make call to external service
      // TODO: Replace with actual external service call
      const response = await fetch('https://api.external-service.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });

      if (!response.ok) {
        throw new Error(
          `External service responded with status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error({
        message: 'Failed to process activity with external service',
        where: 'ActivityService.activityHandler',
        error,
      });
      throw error;
    }
  }
}
