import fastifyHttpProxy from '@fastify/http-proxy';
import {app, type App} from 'electron';

import Fastify from 'fastify';
import path from 'node:path';
import fs from 'node:fs';
import fastifyStatic from '@fastify/static';

const isDev = process.env.NODE_ENV === 'development';
const apiBaseUrl = isDev ? 'http://localhost:3001' : 'https://server.mysigma.ai';

const fastify = Fastify();

// Start Fastify server
const startFastifyServer = async () => {
  fastify.listen({port: 53081});
};

// Add new route for local file access
fastify.get('/local/*', async (request, reply) => {
  try {
    // Extract the path parameter after /local/
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filePath = (request.params as any)['*'];

    // Ensure the path is safe and absolute
    const absolutePath = path.join('/', filePath);

    // Read and return the file contents
    const content = fs.readFileSync(absolutePath, 'utf-8');
    return content;
  } catch (error) {
    reply.code(500).send({error: `Failed to read file: ${error}`});
    return undefined;
  }
});

fastify.register(fastifyHttpProxy, {
  upstream: apiBaseUrl,
  prefix: '/api', // only proxy requests starting with /api
  rewritePrefix: '/', // keep the /api prefix in the proxied request
  http2: false, // set to true if using HTTP/2
  websocket: true,
  preHandler: (request, _reply, done) => {
    // Modify headers before the proxy forwards the request
    request.headers['origin'] = 'https://app.mysigma.ai';
    done();
  },
});

if (isDev) {
  fastify.register(fastifyHttpProxy, {
    upstream: 'http://localhost:3000',
    prefix: '/', // proxy all other requests
    rewritePrefix: '/', // keep the original path
    http2: false, // set to true if using HTTP/2
    websocket: true,
  });
} else {
  fastify.register(fastifyStatic, {
    root: path.join(app.getAppPath(), '/out/sigma/'),
    prefix: '/',
  });
}

export const startAPI = (app: App) => {
  // Start everything
  app.whenReady().then(async () => {
    await startFastifyServer();
  });
};
