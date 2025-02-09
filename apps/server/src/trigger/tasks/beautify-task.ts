import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const prisma = new PrismaClient();

export const beautifyTask = task({
  id: 'beautify-task',
  run: async (payload: { taskId: string; pat: string }) => {
    const sigmaTask = await prisma.task.findUnique({
      where: { id: payload.taskId },
      include: { page: true },
    });

    const recurrenceData = (
      await axios.post(
        `${process.env.BACKEND_URL}/v1/tasks/ai/recurrence`,
        {
          text: sigmaTask.page.title,
          currentTime: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${payload.pat}` } },
      )
    ).data;

    let updatedTask;
    if (recurrenceData) {
      const updateData = {
        // Basic task fields
        ...(recurrenceData.startTime && {
          startTime: recurrenceData.startTime,
        }),
        ...(recurrenceData.endTime && { endTime: recurrenceData.endTime }),
        ...(recurrenceData.dueDate && { dueDate: recurrenceData.dueDate }),
        ...(recurrenceData.remindAt && { remindAt: recurrenceData.remindAt }),

        // Recurrence related fields
        ...(recurrenceData.recurrenceRule && {
          recurrence: [recurrenceData.recurrenceRule],
        }),
        ...(recurrenceData.scheduleText && {
          scheduleText: recurrenceData.scheduleText,
        }),

        // Page related updates
        ...(recurrenceData.title && {
          page: {
            update: { title: recurrenceData.title },
          },
        }),
      };

      updatedTask = await prisma.task.update({
        where: { id: payload.taskId },
        data: updateData,
      });
    }

    return {
      task: updatedTask,
    };
  },
});
