import { z } from 'zod';

export const addReminderSchema = z.object({
  title: z.string().describe('Title of the reminder'),
  htmlDescription: z
    .string()
    .optional()
    .describe('Description of the reminder in HTML format'),
  startTime: z
    .string()
    .describe('Start time of the reminder in ISO 8601 format'),
  endTime: z
    .string()
    .optional()
    .describe('End time of the reminder in ISO 8601 format'),
  recurrence: z
    .array(z.string())
    .optional()
    .describe('Recurrence of the reminder'),
});

export const removeReminderSchema = z.object({
  reminderId: z
    .string()
    .uuid()
    .describe('Unique identifier of the reminder to remove'),
});

export const listRemindersSchema = z.object({
  startTime: z
    .string()
    .optional()
    .describe('Start time of the reminders in ISO 8601 format'),
  endTime: z
    .string()
    .optional()
    .describe('End time of the reminders in ISO 8601 format'),
});

export const updateReminderSchema = z.object({
  reminderId: z
    .string()
    .uuid()
    .describe('Unique identifier of the reminder to update'),
  title: z.string().optional().describe('Title of the reminder'),
  htmlDescription: z
    .string()
    .optional()
    .describe('Description of the reminder in HTML format'),
  startTime: z
    .string()
    .optional()
    .describe('Start time of the reminder in ISO 8601 format'),
  endTime: z
    .string()
    .optional()
    .describe('End time of the reminder in ISO 8601 format'),
  recurrence: z
    .array(z.string())
    .optional()
    .describe('Recurrence of the reminder'),
});

export type AddReminderParams = z.infer<typeof addReminderSchema>;
export type RemoveReminderParams = z.infer<typeof removeReminderSchema>;
export type ListRemindersParams = z.infer<typeof listRemindersSchema>;
export type UpdateReminderParams = z.infer<typeof updateReminderSchema>;
