import * as fs from 'fs/promises';

import createLoadRemoteModule from '@paciolan/remote-module-loader';
import axios from 'axios';

const fetcher = async (url: string) => {
  if (url.startsWith('file://')) {
    // Remove 'file://' and read local file
    const filePath = url.replace('file://', '');
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  }
  // Handle remote URLs with axios
  return axios.get(url).then((request) => request.data);
};

export default createLoadRemoteModule({ fetcher });
