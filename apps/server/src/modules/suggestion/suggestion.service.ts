import { Injectable } from '@nestjs/common';
import { CreateSuggestionDto, GenerateSummaryDto } from '@sigma/types';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { getSuggestionTask } from 'triggers/get-suggestion';

import { getTaskContent } from 'modules/tasks/tasks.utils';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export default class SuggestionService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(data: CreateSuggestionDto) {
    return this.prisma.suggestion.create({
      data: {
        content: data.content,
        taskId: data.taskId,
      },
    });
  }

  async getSuggestion(data: GenerateSummaryDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
      include: { page: true },
    });

    // Get PAT for the user
    const pat = await this.usersService.getOrCreatePat(
      userId,
      task.workspaceId,
    );

    data.summaryData.taskData = getTaskContent(task);

    // Trigger the summary generation
    await tasks.trigger<typeof getSuggestionTask>('get-suggestion', {
      taskId: task.id,
      activityData: data.summaryData,
      pat,
      userId,
    });

    return { message: 'Summary generation triggered' };
  }
}
