import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const jobSources = pgTable('job_sources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  apiUrl: varchar('api_url', { length: 512 }),
  description: text('description'),
  legalNotes: text('legal_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
