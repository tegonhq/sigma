import fastifyHttpProxy from '@fastify/http-proxy';
import {type App} from 'electron';

import Fastify from 'fastify';
import path from 'node:path';
import fs from 'node:fs';
import {integrationsInit} from './integrations-init';

const fastify = Fastify({logger: true});

// Start Fastify server
const startFastifyServer = async () => {
  fastify.listen({port: 8000});
};
// Register the proxy for API requests to localhost:3001
fastify.register(fastifyHttpProxy, {
  upstream: process.env.BACKEND_HOST,
  prefix: '/api', // only proxy requests starting with /api
  rewritePrefix: '/', // keep the /api prefix in the proxied request
  http2: false, // set to true if using HTTP/2
  websocket: true,
  preHandler: (request, _reply, done) => {
    // Modify headers before the proxy forwards the request
    request.headers['origin'] = 'https://app.mysigma.com';
    done();
  },
});

// Register the proxy for other requests to localhost:3000
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3000',
  prefix: '/', // proxy all other requests
  rewritePrefix: '/', // keep the original path
  http2: false, // set to true if using HTTP/2
  websocket: true,
});

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

export const startAPI = (app: App) => {
  // Start everything
  app.whenReady().then(async () => {
    await startFastifyServer();
    await integrationsInit();
  });
};
