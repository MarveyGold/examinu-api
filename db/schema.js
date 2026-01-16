import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    username: text('username'),
    authProvider: text('auth_provider').notNull(),
    authProviderId: text('auth_provider_id').notNull(),
    createdAt: timestamp('createdAt').defaultNow()
  },
  (t) => ({
    authUnique: unique().on(t.authProvider, t.authProviderId)
  })
);
