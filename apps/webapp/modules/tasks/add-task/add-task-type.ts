import { z } from 'zod';

export const NewTaskSchema = z.object({
  description: z.optional(z.string()),
  title: z.string(),
  status: z.string(),
  listId: z.string(),
});
