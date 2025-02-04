import { Injectable } from '@nestjs/common';
import {
  DateFilterEnum,
  GetTaskOccurenceDTO,
  UpdateTaskOccurenceDTO,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';
import { RRule } from 'rrule';

@Injectable()
export class TaskOccurenceService {
  constructor(private prisma: PrismaService) {}

  async getTaskOccurences(workspaceId: string, filters: GetTaskOccurenceDTO) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      workspaceId,
      deleted: null,
    };

    // Add taskId filter if provided
    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    // Add status filter if provided
    if (filters.status) {
      where.status = filters.status;
    }

    // Add startTime filters
    if (filters.startTime) {
      where.startTime = {};
      switch (filters.startTimeFilter) {
        case DateFilterEnum.EQ:
          where.startTime = new Date(filters.startTime);
          break;
        case DateFilterEnum.GTE:
          where.startTime = { gte: new Date(filters.startTime) };
          break;
        case DateFilterEnum.LTE:
          where.startTime = { lte: new Date(filters.startTime) };
          break;
        default:
          where.startTime = new Date(filters.startTime);
      }
    }

    // Add endTime filters
    if (filters.endTime) {
      where.endTime = {};
      switch (filters.endTimeFilter) {
        case DateFilterEnum.EQ:
          where.endTime = new Date(filters.endTime);
          break;
        case DateFilterEnum.GTE:
          where.endTime = { gte: new Date(filters.endTime) };
          break;
        case DateFilterEnum.LTE:
          where.endTime = { lte: new Date(filters.endTime) };
          break;
        default:
          where.endTime = new Date(filters.endTime);
      }
    }

    return await this.prisma.taskOccurrence.findMany({
      where,
      include: {
        task: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getTaskOccurence(taskOccurenceId: string) {
    return await this.prisma.taskOccurrence.findUnique({
      where: { id: taskOccurenceId },
    });
  }

  async createTaskOccurance(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task.recurrence || task.recurrence.length === 0) {
      return null;
    }
    const rrule = RRule.fromString(task.recurrence[0]);

    // Set up the date range for next 2 days
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 2);

    // Get base occurrences for the date range
    const baseOccurrences = rrule.between(startDate, endDate);

    // Map the base dates to include the correct time from task.startTime
    const occurrences = baseOccurrences.map((date) => {
      const occurrence = new Date(date);
      occurrence.setHours(
        task.startTime.getHours(),
        task.startTime.getMinutes(),
        task.startTime.getSeconds(),
        task.startTime.getMilliseconds(),
      );
      return occurrence;
    });

    // Filter out any occurrences that have already passed
    const futureOccurrences = occurrences.filter((date) => date > now);

    return await Promise.all(
      futureOccurrences.map((date) =>
        this.prisma.taskOccurrence.upsert({
          where: {
            taskId_startTime_endTime: {
              taskId: task.id,
              startTime: date,
              endTime: task.endTime
                ? new Date(
                    date.getTime() +
                      (task.endTime.getTime() - task.startTime!.getTime()),
                  )
                : date,
            },
          },
          create: {
            taskId: task.id as string,
            workspaceId: task.workspaceId,
            startTime: date,
            endTime: task.endTime
              ? new Date(
                  date.getTime() +
                    (task.endTime.getTime() - task.startTime!.getTime()),
                )
              : date,
            status: 'Todo',
          },
          update: {
            deleted: null,
          },
        }),
      ),
    );
  }

  async updateTaskOccurance(
    taskOccurenceId: string,
    updateTaskOccurenceDto: UpdateTaskOccurenceDTO,
  ) {
    return await this.prisma.taskOccurrence.update({
      where: { id: taskOccurenceId },
      data: updateTaskOccurenceDto,
    });
  }

  async updateTaskOccuranceByTask(taskId: string) {
    await this.deleteTaskOccuranceByTask(taskId);

    return await this.createTaskOccurance(taskId);
  }

  async deleteTaskOccurence(taskOccurenceId: string) {
    return await this.prisma.taskOccurrence.update({
      where: { id: taskOccurenceId },
      data: { deleted: new Date().toISOString() },
    });
  }

  async deleteTaskOccuranceByTask(taskId: string) {
    return await this.prisma.taskOccurrence.updateMany({
      where: {
        taskId,
        startTime: {
          gte: new Date(),
        },
      },
      data: { deleted: new Date().toISOString() },
    });
  }
}
