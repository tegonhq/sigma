import { Injectable } from '@nestjs/common';
import {
  AgentWorklogStateEnum,
  LLMModelEnum,
  ReccurenceInput,
  recurrencePrompt,
} from '@redplanethq/sol-sdk';
import { endOfDay, startOfDay } from 'date-fns';
import { PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { LoggerService } from 'modules/logger/logger.service';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';

@Injectable()
export default class TasksAIService {
  private readonly logger: LoggerService = new LoggerService('TasksAIService');

  constructor(
    private aiRequestsService: AIRequestsService,
    private prisma: PrismaService,
    private taskOccurrence: TaskOccurenceService,
  ) {}

  async schedule(recurrenceInput: ReccurenceInput, workspaceId: string) {
    const agentWorklog = await this.prisma.agentWorklog.create({
      data: {
        modelId: recurrenceInput.taskIds[0],
        modelName: 'Task',
        state: AgentWorklogStateEnum.Thinking,
        type: 'Schedule',
        workspaceId,
      },
    });

    const data = await this.recurrence(recurrenceInput, workspaceId);

    await this.prisma.taskOccurrence.updateMany({
      where: {
        taskId: {
          in: recurrenceInput.taskIds,
        },
      },
      data: {
        deleted: new Date(),
      },
    });

    if (data.startTime && !data.recurrenceRule[0]) {
      await this.taskOccurrence.createTaskOccurence(
        {
          taskIds: recurrenceInput.taskIds,
          startTime: startOfDay(data.startTime).toISOString(),
          endTime: endOfDay(data.startTime).toISOString(),
        },
        workspaceId,
      );
    } else {
      await this.prisma.task.updateMany({
        where: {
          id: {
            in: recurrenceInput.taskIds,
          },
        },
        data: {
          status: 'Todo',
          recurrence: data.recurrenceRule ? data.recurrenceRule : [],
          scheduleText: data.scheduleText ? data.scheduleText : null,
          startTime: data.startTime ? data.startTime : null,
          endTime: data.endTime ? data.endTime : null,
        },
      });
    }

    await this.prisma.agentWorklog.update({
      where: {
        id: agentWorklog.id,
      },
      data: {
        state: AgentWorklogStateEnum.Done,
      },
    });
  }

  async recurrence(reccurenceInput: ReccurenceInput, workspaceId: string) {
    const recurrenceOutput = await this.aiRequestsService.getLLMRequest(
      {
        messages: [
          {
            role: 'user',
            content: recurrencePrompt
              .replace('{{text}}', reccurenceInput.text)
              .replace('{{currentTime}}', reccurenceInput.currentTime),
          },
        ],
        llmModel: LLMModelEnum.CLAUDESONNET,
        model: 'recurrence',
      },
      workspaceId,
    );
    const outputMatch = recurrenceOutput.match(/<output>(.*?)<\/output>/s);

    if (!outputMatch) {
      this.logger.error({
        message: 'No output found in recurrence response',
        where: `TasksAIService.recurrence`,
      });
      throw new Error('Invalid response format from AI');
    }

    try {
      const jsonStr = outputMatch[1].trim();
      const parsedOutput = JSON.parse(jsonStr);
      return parsedOutput;
    } catch (error) {
      this.logger.error({
        message: 'Failed to parse recurrence JSON output',
        payload: error,
        where: `TasksAIService.recurrence`,
      });
      throw new Error('Invalid JSON in AI response');
    }
  }

  async duedate(recurrenceInput: ReccurenceInput, workspaceId: string) {
    const agentWorklog = await this.prisma.agentWorklog.create({
      data: {
        modelId: recurrenceInput.taskIds[0],
        modelName: 'Task',
        state: AgentWorklogStateEnum.Thinking,
        type: 'DueDate',
        workspaceId,
      },
    });

    const data = await this.recurrence(recurrenceInput, workspaceId);

    if (data.dueDate) {
      await this.prisma.task.updateMany({
        where: {
          id: {
            in: recurrenceInput.taskIds,
          },
        },
        data: {
          status: 'Todo',
          dueDate: data.dueDate,
        },
      });
    }

    if (data.startTime) {
      await this.prisma.task.updateMany({
        where: {
          id: {
            in: recurrenceInput.taskIds,
          },
        },
        data: {
          status: 'Todo',
          dueDate: endOfDay(data.startTime),
        },
      });
    }

    await this.prisma.agentWorklog.update({
      where: {
        id: agentWorklog.id,
      },
      data: {
        state: AgentWorklogStateEnum.Done,
      },
    });
  }
}
