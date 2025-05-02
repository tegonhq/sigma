import * as fs from 'fs/promises';

import createLoadRemoteModule, {
  createRequires,
} from '@paciolan/remote-module-loader';
import axios from 'axios';

export const fetcher = async (url: string) => {
  if (url.startsWith('file://')) {
    // Remove 'file://' and read local file
    const filePath = url.replace('file://', '');
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  }
  // Handle remote URLs with axios
  const response = await axios.get(url);

  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRequires = (axios: any) => createRequires({ axios });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadRemoteModule = async (requires: any) =>
  createLoadRemoteModule({ fetcher, requires });

export function createAxiosInstance(token: string) {
  const instance = axios.create();

  instance.interceptors.request.use((config) => {
    if (
      config.url.includes(process.env.FRONTEND_HOST) ||
      config.url.includes(process.env.BACKEND_HOST)
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}
