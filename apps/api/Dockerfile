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

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Prisma-এর জন্য openssl ইনস্টল করা আবশ্যক
RUN apt-get update -y && apt-get install -y openssl

# Prisma generate কমান্ডটি api ওয়ার্কস্পেসের ভেতরে গিয়ে চালান
RUN cd apps/api && pnpm exec prisma generate

# বিল্ড কমান্ডটি রুট থেকে চালান (Turborepo এর জন্য)
RUN pnpm turbo build --filter=api

# ---- Stage 3: Production runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# রানার স্টেজেও Prisma-এর জন্য openssl লাগবে
RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app .

EXPOSE 4000

# মাইগ্রেশন এবং অ্যাপ রান করার কমান্ডটি api ফোল্ডার থেকে এক্সিকিউট করুন
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/src/main.js"]