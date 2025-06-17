import { z } from 'zod';

export const RetrieveMemorySchema = z.object({
  query: z.string().describe('Query to retrieve memory'),
});

export type RetrieveMemoryParams = z.infer<typeof RetrieveMemorySchema>;
