import { PrismaInstrumentation } from '@prisma/instrumentation';
import {
  additionalPackages,
  syncEnvVars,
} from '@trigger.dev/build/extensions/core';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';
import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: 'proj_common',
  logLevel: 'log',
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
      syncEnvVars(({ env }) => {
        return {
          DATABASE_URL: env.DATABASE_URL,
          BACKEND_URL: env.BACKEND_HOST,
        };
      }),
      additionalPackages({
        packages: ['@sigma/types'],
      }),
      prismaExtension({
        // update this to the path of your Prisma schema file
        schema: 'prisma/schema.prisma',
      }),
    ],
  },
  maxDuration: 300,
});
