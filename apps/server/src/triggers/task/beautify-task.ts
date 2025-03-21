import { PrismaClient } from '@prisma/client';
import {
  AgentWorklogStateEnum,
  beautifyPrompt,
  LLMModelEnum,
  ModelNameEnum,
} from '@tegonhq/sigma-sdk';
import { logger, task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const prisma = new PrismaClient();

export const beautifyTask = task({
  id: 'beautify-task',
  run: async (payload: { taskId: string; pat: string }) => {
    const sigmaTask = await prisma.task.findUnique({
      where: { id: payload.taskId },
      include: { page: true },
    });
    const agentWorklog = await prisma.agentWorklog.create({
      data: {
        modelId: payload.taskId,
        modelName: ModelNameEnum.Task,
        state: AgentWorklogStateEnum.Thinking,
        type: 'Beautify Task',
        workspaceId: sigmaTask.workspaceId,
      },
    });

    const listsData = await prisma.list.findMany({
      where: { deleted: null },
      include: { page: true },
    });

    const lists = listsData.map((list) => `${list.id}_${list.page.title}`);

    // Run both API requests in parallel
    const [recurrenceData, beautifyOutput] = await Promise.all([
      axios
        .post(
          `${process.env.BACKEND_HOST}/v1/tasks/ai/recurrence`,
          {
            text: sigmaTask.page.title,
            currentTime: new Date().toISOString(),
          },
          { headers: { Authorization: `Bearer ${payload.pat}` } },
        )
        .then((response) => response.data),

      axios
        .post(
          `${process.env.BACKEND_HOST}/v1/ai_requests`,
          {
            messages: [
              {
                role: 'user',
                content: beautifyPrompt
                  .replace('{{text}}', sigmaTask.page.title)
                  .replace('{{lists}}', lists.join('\n')),
              },
            ],
            llmModel: LLMModelEnum.CLAUDESONNET,
            model: 'beautify',
          },
          { headers: { Authorization: `Bearer ${payload.pat}` } },
        )
        .then((response) => response.data),
    ]);

    const outputMatch = beautifyOutput.match(/<output>(.*?)<\/output>/s);

    if (!outputMatch) {
      logger.error('No output found in recurrence response');
      await prisma.agentWorklog.update({
        where: { id: agentWorklog.id },
        data: { state: AgentWorklogStateEnum.Failed },
      });
      throw new Error('Invalid response format from AI');
    }

    let updatedTask;
    try {
      const jsonStr = outputMatch[1].trim();
      const beautifyData = JSON.parse(jsonStr);
      const outputData = { ...recurrenceData, ...beautifyData };
      if (outputData) {
        const updateData = {
          // Basic task fields
          ...(outputData.startTime && {
            startTime: outputData.startTime,
          }),
          ...(outputData.endTime && { endTime: outputData.endTime }),
          ...(outputData.dueDate && { dueDate: outputData.dueDate }),

          // Recurrence related fields
          ...(outputData.recurrenceRule && {
            recurrence: outputData.recurrenceRule,
          }),
          ...(outputData.scheduleText && {
            scheduleText: outputData.scheduleText,
          }),

          ...(outputData.listId && {
            list: { connect: { id: outputData.listId } },
          }),
        };

        await prisma.page.update({
          where: { id: sigmaTask.pageId },
          data: {
            title: outputData.title,
          },
        });

        updatedTask = await prisma.task.update({
          where: { id: payload.taskId },
          data: updateData,
          include: {
            page: true,
          },
        });
      }

      await prisma.agentWorklog.update({
        where: { id: agentWorklog.id },
        data: { state: AgentWorklogStateEnum.Done },
      });
    } catch (error) {
      logger.error('Failed to parse recurrence JSON output');

      await prisma.agentWorklog.update({
        where: { id: agentWorklog.id },
        data: { state: AgentWorklogStateEnum.Failed },
      });
      throw new Error('Invalid JSON in AI response');
    }

    return {
      task: updatedTask,
    };
  },
});
