# ---- Stage 1: Prune the monorepo to just what `api` needs ----
FROM node:20-slim AS pruner
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ---- Stage 2: Install deps + build ----
FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN cd apps/api && pnpm exec prisma generate

RUN pnpm turbo build --filter=api

# ---- Stage 3: Production runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app .

USER node

EXPOSE 4000

CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node $(find dist -name main.js | head -n1)"]