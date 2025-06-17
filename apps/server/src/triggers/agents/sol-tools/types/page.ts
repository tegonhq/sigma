import { z } from 'zod';

// Page schemas
export const PageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  htmlDescription: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const GetPageSchema = z.object({
  pageId: z
    .string()
    .uuid()
    .describe('Unique identifier of the page to retrieve'),
});

export const UpdatePageSchema = z.object({
  pageId: z
    .string()
    .uuid()
    .describe(
      'Unique identifier (UUID) of the page to update. Do NOT use page title or date string.',
    ),
  title: z.string().optional().describe('New title for the page'),
  htmlDescription: z
    .string()
    .optional()
    .describe('Updated content for the page in tiptap HTML format'),
});

export const DeletePageSchema = z.object({
  pageId: z.string().uuid().describe('Unique identifier of the page to delete'),
});

export const SearchPagesSchema = z.object({
  query: z
    .string()
    .describe(
      'Search title of the page. For day pages, date should be in DD-MM-YYYY format',
    ),
});

// Export types
export type Page = z.infer<typeof PageSchema>;
export type GetPageParams = z.infer<typeof GetPageSchema>;
export type UpdatePageParams = z.infer<typeof UpdatePageSchema>;
export type DeletePageParams = z.infer<typeof DeletePageSchema>;
export type SearchPagesParams = z.infer<typeof SearchPagesSchema>;
