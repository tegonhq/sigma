import axios from 'axios';

import {
  GetPageParams,
  UpdatePageParams,
  DeletePageParams,
  SearchPagesParams,
  Page,
} from '../types/page.js';

/**
 * Get a page by its ID
 * @param params The page ID parameters
 * @returns The page data
 */
export async function getPage(params: GetPageParams) {
  const response = await axios.get(`/api/v1/pages/${params.pageId}`);
  return response.data;
}

/**
 * Update an existing page
 * @param params The update parameters
 * @returns The updated page
 */
export async function updatePage(params: UpdatePageParams) {
  const updateData = {
    ...(params.title && { title: params.title }),
    ...(params.htmlDescription && { htmlDescription: params.htmlDescription }),
  };

  const response = await axios.post(
    `/api/v1/pages/${params.pageId}`,
    updateData,
  );
  return response.data;
}

/**
 * Delete a page by its ID
 * @param params The page ID parameters
 * @returns The deletion result
 */
export async function deletePage(params: DeletePageParams) {
  const response = await axios.delete(`/api/v1/pages/${params.pageId}`);

  return response.data;
}

/**
 * Search for pages based on query string
 * @param params Search parameters including query string
 * @returns Array of matching pages
 */
export async function searchPages(params: SearchPagesParams): Promise<Page[]> {
  const response = await axios.get(`/api/v1/pages/search`, {
    params: {
      query: params.query,
    },
  });

  return response.data;
}
