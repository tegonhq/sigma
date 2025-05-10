import fastifyHttpProxy from '@fastify/http-proxy';
import {app, type App} from 'electron';

import Fastify from 'fastify';
import path from 'node:path';
import fastifyStatic from '@fastify/static';

const isDev = process.env.NODE_ENV === 'development';
const apiBaseUrl = isDev ? 'http://localhost:3001' : 'https://server.mysigma.ai';

const fastify = Fastify();

// Start Fastify server
const startFastifyServer = async () => {
  fastify.listen({port: 53081});
};

fastify.register(fastifyHttpProxy, {
  upstream: apiBaseUrl,
  prefix: '/api', // only proxy requests starting with /api
  rewritePrefix: '/', // keep the /api prefix in the proxied request
  http2: false, // set to true if using HTTP/2
  websocket: true,
  preHandler: (request, _reply, done) => {
    // Modify headers before the proxy forwards the request
    request.headers['origin'] = 'https://app.mysigma.ai';

    // Special handling for file upload endpoints
    if (request.url.includes('/upload') && request.method === 'POST') {
      // Log upload actions or add special headers if needed
      console.log('File upload detected');
      // You could add special headers for upload requests if needed
      // request.headers['x-file-upload'] = 'true';
    }

    done();
  },
});

fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:2000',
  prefix: '/ai', // only proxy requests starting with /api
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
