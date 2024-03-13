import type { Config } from 'drizzle-kit';

export default {
  schema: './functions/db/schema.ts',
  out: './functions/db/migrations',
  driver: 'libsql',
} satisfies Config;
