import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

const DIRECT_URL = process.env.DATABASE_URL as string;
const POOLER_URL = process.env.DATABASE_URL_POOLER as string;

export default defineConfig({
  // @ts-expect-error - earlyAccess is required for prisma.config.ts but might not be typed yet
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),

  datasource: {
    url: DIRECT_URL,
  },

  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { default: pg } = await import('pg');

      const pool = new pg.Pool({
        connectionString: POOLER_URL || DIRECT_URL,
        ssl: { rejectUnauthorized: false },
      });

      return new PrismaPg(pool);
    },
  },
});
