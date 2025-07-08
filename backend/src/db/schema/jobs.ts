import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';

// Structured location type for jobs
export type JobLocation = {
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
};

export const jobs = pgTable('jobs', {
  /** Unique internal job ID */
  id: serial('id').primaryKey(),
  /** Original job board's job ID */
  sourceId: varchar('source_id', { length: 255 }).notNull(),
  /** Name of the job source (e.g., Indeed, LinkedIn) */
  sourceName: varchar('source_name', { length: 100 }).notNull(),
  /** Job title */
  title: varchar('title', { length: 255 }).notNull(),
  /** Company name as provided by the source */
  companyName: varchar('company_name', { length: 255 }).notNull(),
  /** Structured location: city, state, country, zip */
  location: jsonb('location').$type<JobLocation>(),
  /** Whether the job is remote */
  isRemote: boolean('is_remote'),
  /** Full job description (HTML or Markdown) */
  description: text('description'),
  /** Original application/job posting URL */
  url: varchar('url', { length: 512 }),
  /** Date the job was posted */
  postedDate: date('posted_date'),
  /** Date the job expires (if available) */
  expirationDate: date('expiration_date'),
  /** Minimum salary (if available) */
  salaryMin: integer('salary_min'),
  /** Maximum salary (if available) */
  salaryMax: integer('salary_max'),
  /** Salary currency (e.g., USD, EUR) */
  salaryCurrency: varchar('salary_currency', { length: 10 }),
  /** Job type (full-time, part-time, contract, internship) */
  jobType: varchar('job_type', { length: 50 }),
  /** Experience level (entry, mid, senior, director) */
  experienceLevel: varchar('experience_level', { length: 50 }),
  /** Array of extracted skills/keywords */
  skills: jsonb('skills').$type<string[]>(),
  /** Industry/category */
  industry: varchar('industry', { length: 100 }),
  /** Normalized company name for deduplication */
  normalizedCompanyName: varchar('normalized_company_name', { length: 255 }),
  /** Internal creation timestamp */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  /** Internal update timestamp */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
