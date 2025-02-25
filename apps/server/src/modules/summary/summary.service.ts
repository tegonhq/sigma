import { Injectable } from '@nestjs/common';
import { CreateSummaryDto, GenerateSummaryDto } from '@sigma/types';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { generateSummaryTask } from 'triggers/task/generate-summary';

import { UsersService } from 'modules/users/users.service';

@Injectable()
export default class SummaryService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(data: CreateSummaryDto) {
    return this.prisma.summary.create({
      data: {
        content: data.content,
        taskId: data.taskId,
      },
    });
  }

  async generate(data: GenerateSummaryDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
      include: { page: true },
    });

    if (!task.page.description) {
      return { message: 'Task page is empty to generate summary' };
    }

    // Get PAT for the user
    const pat = await this.usersService.getOrCreatePat(
      userId,
      task.workspaceId,
    );

    // Trigger the summary generation
    await tasks.trigger<typeof generateSummaryTask>('generate-summary', {
      taskId: task.id,
      summaryData: data.summaryData,
      pat,
      userId,
    });

    return { message: 'Summary generation triggered' };
  }
}
