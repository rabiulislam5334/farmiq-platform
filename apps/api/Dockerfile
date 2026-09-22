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

# build শেষ, এখন devDependencies ছেঁটে ফেলে শুধু production deps রাখা হচ্ছে
RUN pnpm install --prod --frozen-lockfile

# ---- Stage 3: Production runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# node:20-slim ইমেজে ডিফল্টভাবেই একটা non-root "node" ইউজার (UID 1000) থাকে
COPY --from=builder --chown=node:node /app .

USER node

EXPOSE 4000

CMD ["sh", "-c", "cd apps/api && pnpm exec prisma migrate deploy && node dist/src/main.js"]