import fastifyHttpProxy from '@fastify/http-proxy';
import type {App} from 'electron';

import Fastify from 'fastify';

const fastify = Fastify({logger: true});

// Start Fastify server
const startFastifyServer = async () => {
  fastify.listen({port: 8000});
};
// Register the proxy for API requests to localhost:3001
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3001',
  prefix: '/api', // only proxy requests starting with /api
  rewritePrefix: '/', // keep the /api prefix in the proxied request
  http2: false, // set to true if using HTTP/2
  websocket: true,
});

// Register the proxy for other requests to localhost:3000
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3000',
  prefix: '/', // proxy all other requests
  rewritePrefix: '/', // keep the original path
  http2: false, // set to true if using HTTP/2
  websocket: true,
});

export const startAPI = (app: App) => {
  // Start everything
  app.whenReady().then(async () => {
    await startFastifyServer();
  });
};
