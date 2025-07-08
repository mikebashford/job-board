import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  salt: varchar('salt', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  currentLocation: varchar('current_location', { length: 255 }),
  preferredJobTitles: jsonb('preferred_job_titles').$type<string[]>(),
  preferredLocations: jsonb('preferred_locations').$type<unknown[]>(), // TODO: Define Location type
  preferredJobTypes: jsonb('preferred_job_types').$type<string[]>(),
  minSalaryExpectation: integer('min_salary_expectation'),
  maxSalaryExpectation: integer('max_salary_expectation'),
  isRemotePreferred: boolean('is_remote_preferred'),
  skills: jsonb('skills').$type<string[]>(),
  experienceSummary: text('experience_summary'),
  education: jsonb('education').$type<unknown[]>(), // TODO: Define Education type
  workExperience: jsonb('work_experience').$type<unknown[]>(), // TODO: Define WorkExperience type
  lastResumeUploadDate: timestamp('last_resume_upload_date', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
