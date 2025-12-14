FROM node:22-alpine AS base

WORKDIR /app

FROM base AS build

COPY package.json package-lock.json ./

RUN npm pkg delete scripts.prepare && \
    npm ci

COPY tsconfig* vite.config.ts ./

COPY project.inlang/ ./project.inlang/
COPY messages/ ./messages/
COPY public/ ./public/
COPY src/ ./src/

FROM build AS build-production

RUN NODE_ENV=production \
    npm run build

FROM base

COPY --from=build-production /app/.output ./.output

CMD ["node", ".output/server/index.mjs"]