# ---- Stage 1: Prune the monorepo to just what `api` needs ----
# Alpine এর পরিবর্তে slim (Debian) ইমেজ ব্যবহার করা হয়েছে
FROM node:20-slim AS pruner
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ---- Stage 2: Install deps + build ----
FROM node:20-slim AS builder
WORKDIR /app

# corepack ব্যবহার করে pnpm ইনস্টল করা হচ্ছে (সবচেয়ে নিরাপদ পদ্ধতি)
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Prisma-এর জন্য openssl ইনস্টল করা আবশ্যক
RUN apt-get update -y && apt-get install -y openssl

RUN pnpm exec prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm turbo build --filter=api

# ---- Stage 3: Production runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# রানার স্টেজেও Prisma-এর জন্য openssl লাগবে
RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app .

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/src/main.js"]