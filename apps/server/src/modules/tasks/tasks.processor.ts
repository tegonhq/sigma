import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { JsonObject, UserTypeEnum } from '@sigma/types';
import axios from 'axios';
import { Job } from 'bullmq';
import { PrismaService } from 'nestjs-prisma';

import { ConversationService } from 'modules/conversation/conversation.service';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    private prisma: PrismaService,
    private conversationService: ConversationService,
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.name} with data:`, job.data);

    switch (job.name) {
      case 'scheduled-task':
        return this.processScheduledTask(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  async processScheduledTask(job: Job<{ taskId: string }>) {
    const { taskId } = job.data;
    this.logger.log(`Processing task ${taskId}`);

    try {
      // Update task status to In Progress
      const task = await this.prisma.task.update({
        where: { id: taskId },
        data: { status: 'In Progress' },
      });

      // Execute your task logic here
      // ...

      // Get the task's page title
      const taskPage = await this.prisma.page.findUnique({
        where: { id: task.pageId },
        select: { title: true },
      });

      if (!taskPage?.title) {
        throw new Error('Task page not found or has no title');
      }

      // Get the workspace owner's ID
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: task.workspaceId },
        select: { userId: true },
      });

      if (!workspace?.userId) {
        throw new Error('Workspace owner not found');
      }

      // Create conversation via ConversationService
      const conversation = await this.conversationService.createConversation(
        task.workspaceId,
        workspace.userId,
        {
          message: taskPage.title,
          userType: UserTypeEnum.User,
        },
      );

      // Update task metadata with conversation ID
      const updatedMetadata = {
        ...(task.metadata as JsonObject),
        conversationId: conversation.id,
      };
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          metadata: updatedMetadata,
        },
      });

      const metadata = task.metadata as JsonObject;
      const instructionPayload = {
        conversation_id: metadata.conversationId as string,
        conversation_history_id: metadata.conversationHistoryId as string,
        integration_names: ['sigma'],
        workspace_id: task.workspaceId,
        auto_mode: true,
        stream: false,
      };

      try {
        const response = await axios.post(
          'http://localhost:2000/instruction',
          instructionPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer `,
            },
          },
        );

        this.logger.log(
          `Instruction API response for task ${taskId}:`,
          response.data,
        );
      } catch (error) {
        this.logger.error('Failed to call instruction API:', error);
        throw error;
      }

      // Update task status to Done
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'Done',
          metadata: {
            ...(task.metadata as JsonObject),
            lastExecuted: new Date().toISOString(),
          },
        },
      });

      this.logger.log(`Successfully completed task ${taskId}`);
    } catch (error) {
      this.logger.error(`Failed to process task ${taskId}:`, error);

      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: 'Failed' },
      });

      throw error; // Rethrow to let BullMQ handle retries
    }
  }
}
