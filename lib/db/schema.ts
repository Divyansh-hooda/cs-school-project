import { integer, jsonb, pgTable, timestamp } from 'drizzle-orm/pg-core'

export const tasklaneState = pgTable('tasklane_state', {
  id: integer('id').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
