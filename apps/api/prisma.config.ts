import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

const DIRECT_URL = process.env.DATABASE_URL; // এখন Session Pooler (5432)
const POOLER_URL = process.env.DATABASE_URL_POOLER;

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),

  datasource: {
    url: DIRECT_URL, // migration-এর জন্য
  },

  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { default: pg } = await import('pg');

      const pool = new pg.Pool({
        connectionString: DIRECT_URL,
        ssl: { rejectUnauthorized: false },
      });

      return new PrismaPg(pool);
    },
  },
});
