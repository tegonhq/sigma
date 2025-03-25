import createLoadRemoteModule, {
  createRequires,
} from '@paciolan/remote-module-loader';
import { IntegrationDefinition } from '@tegonhq/sigma-sdk';
import { logger, task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const fetcher = async (url: string) => {
  // Handle remote URLs with axios
  const response = await axios.get(url);

  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadRemoteModule = async (requires: any) =>
  createLoadRemoteModule({ fetcher, requires });

function createAxiosInstance(token: string) {
  const instance = axios.create();

  instance.interceptors.request.use((config) => {
    // Check if URL starts with /api and doesn't have a full host
    if (config.url?.startsWith('/api')) {
      config.url = `${process.env.BACKEND_HOST}${config.url.replace('/api/', '/')}`;
    }

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRequires = (axios: any) => createRequires({ axios });

export const integrationRun = task({
  id: 'integration-run',
  run: async ({
    pat,
    integrationDefinition,
    event,
  }: {
    pat: string;
    // This is the event you want to pass to the integration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any;
    integrationDefinition: IntegrationDefinition;
  }) => {
    const remoteModuleLoad = await loadRemoteModule(
      getRequires(createAxiosInstance(pat)),
    );

    logger.info(`${integrationDefinition.url}/backend/index.js`);

    const integrationFunction = await remoteModuleLoad(
      `${integrationDefinition.url}/backend/index.js`,
    );

    return await integrationFunction.run(event);
  },
});
