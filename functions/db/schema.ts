import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').unique().notNull(),
  username: text('username'),
  password_hash: text('password_hash').notNull(),
  confirmed_at: text('confirmed_at'),
  confirmation_token: text('confirmation_token').unique().notNull(),
});
