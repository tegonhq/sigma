FROM node:18-alpine3.20 AS pruner
WORKDIR /app

COPY --chown=node:node . .
RUN npx -q turbo@1.10.9 prune --scope=server --docker
RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Base strategy to have layer caching
FROM node:18-alpine3.20 AS base
RUN apk add openssl dumb-init libc6-compat
WORKDIR /app
COPY --chown=node:node .gitignore .gitignore
COPY --from=pruner --chown=node:node /app/out/json/ .
COPY --from=pruner --chown=node:node /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner --chown=node:node /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
## Dev deps
FROM base AS dev-deps
WORKDIR /app
# Corepack is used to install pnpm
RUN npm install -g corepack && corepack enable
ENV NODE_ENV development
RUN pnpm install --ignore-scripts --no-frozen-lockfile

## Production deps
FROM base AS production-deps
WORKDIR /app
# Corepack is used to install pnpm
RUN npm install -g corepack && corepack enable
ENV NODE_ENV production
RUN pnpm install --prod --no-frozen-lockfile
COPY --from=pruner --chown=node:node /app/apps/server/prisma/schema.prisma /app/apps/server/prisma/schema.prisma
ENV NPM_CONFIG_IGNORE_WORKSPACE_ROOT_CHECK true
# RUN pnpx prisma@5.4.1 generate --schema /app/apps/server/prisma/schema.prisma

## Builder (builds the server)
FROM base AS builder
WORKDIR /app
# Corepack is used to install pnpm
RUN npm install -g corepack && corepack enable

COPY --from=pruner --chown=node:node /app/out/full/ .
COPY --from=dev-deps --chown=node:node /app/ .
COPY --chown=node:node turbo.json turbo.json
COPY --from=pruner --chown=node:node /app/apps/server/prisma/schema.prisma /app/apps/server/prisma/schema.prisma
RUN pnpm run build --filter=server...

# Runner
FROM node:18-alpine3.20 AS runner
RUN apk update \
  && apk add --no-cache openssl\
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /var/cache/apk/*
RUN apk add --no-cache dumb-init bash
WORKDIR /app
RUN npm install -g corepack && corepack enable
ENV NODE_ENV production

COPY --from=pruner --chown=node:node /app/out/full/ .
COPY --from=production-deps --chown=node:node /app .
COPY --from=builder  --chown=node:node /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder  --chown=node:node /app/packages/editor-extensions/dist ./apps/server/node_modules/@sol/editor-extensions/dist
COPY --from=builder  --chown=node:node /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder  --chown=node:node /app/apps/server/dist ./apps/server/dist
COPY --from=builder  --chown=node:node /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder  --chown=node:node /app/apps/server/templates ./apps/server/templates
COPY --from=builder  --chown=node:node /app/apps/server/scripts ./apps/server/scripts

EXPOSE 3001
EXPOSE 5555
EXPOSE 1234

USER node

CMD ["sh", "apps/server/scripts/entrypoint.sh"]