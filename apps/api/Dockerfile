# ---- Stage 1: Prune the monorepo to just what `api` needs ----
FROM node:20-alpine AS pruner
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ---- Stage 2: Install deps + build ----
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm exec prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm turbo build --filter=api

# ---- Stage 3: Production runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app .

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/src/main.js"]