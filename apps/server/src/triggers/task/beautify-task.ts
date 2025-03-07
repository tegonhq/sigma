import { PrismaClient } from '@prisma/client';
import {
  AgentWorklogStateEnum,
  beautifyPrompt,
  LLMModelEnum,
  ModelNameEnum,
} from '@sigma/types';
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

    const listsData = await prisma.list.findMany({ where: { deleted: null } });

    const lists = listsData.map((list) => `${list.id}_${list.name}`);

    const beautifyOutput = (
      await axios.post(
        `${process.env.BACKEND_HOST}/v1/ai_requests`,
        {
          messages: [
            {
              role: 'user',
              content: beautifyPrompt
                .replace('{{text}}', sigmaTask.page.title)
                .replace('{{currentTime}}', new Date().toISOString())
                .replace('{{lists}}', lists.join('\n')),
            },
          ],
          llmModel: LLMModelEnum.CLAUDESONNET,
          model: 'beautify',
        },
        { headers: { Authorization: `Bearer ${payload.pat}` } },
      )
    ).data;

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
      if (beautifyData) {
        const updateData = {
          // Basic task fields
          ...(beautifyData.startTime && {
            startTime: beautifyData.startTime,
          }),
          ...(beautifyData.endTime && { endTime: beautifyData.endTime }),
          ...(beautifyData.dueDate && { dueDate: beautifyData.dueDate }),

          // Recurrence related fields
          ...(beautifyData.recurrenceRule && {
            recurrence: [beautifyData.recurrenceRule],
          }),
          ...(beautifyData.scheduleText && {
            scheduleText: beautifyData.scheduleText,
          }),

          // Page related updates
          ...(beautifyData.title && { title: beautifyData.title }),

          ...(beautifyData.listId && { listId: beautifyData.listId }),
        };
        updatedTask = (
          await axios.post(
            `${process.env.BACKEND_HOST}/v1/tasks/${payload.taskId}`,
            updateData,
            { headers: { Authorization: `Bearer ${payload.pat}` } },
          )
        ).data;
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
