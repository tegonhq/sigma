import { PrismaInstrumentation } from '@prisma/instrumentation';
import {
  additionalPackages,
  syncEnvVars,
} from '@trigger.dev/build/extensions/core';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';
import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: 'proj_sigma_common',
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 1,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/triggers'],
  instrumentations: [new PrismaInstrumentation()],
  build: {
    extensions: [
      syncEnvVars(({ env }) => ({
        DATABASE_URL: env.DATABASE_URL,
        BACKEND_URL: env.BACKEND_HOST,
      })),
      additionalPackages({
        packages: ['@tegonhq/sigma-sdk'],
      }),
      prismaExtension({
        schema: 'prisma/schema.prisma',
      }),
    ],
  },
});
