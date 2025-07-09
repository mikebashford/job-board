import {
  cleanWhitespace,
  removeSpecialCharacters,
  stripHtmlTags,
  normalizeCase,
  normalizeLocation,
  extractSkills,
} from './dataCleaning';
import type { JobLocation } from '../db/schema/jobs';

/**
 * Raw job input type (from API or scraper)
 */
export type RawJobInput = {
  sourceId: string;
  sourceName: string;
  title: string;
  companyName: string;
  location: string;
  isRemote?: boolean;
  description: string;
  url?: string;
  postedDate?: string | Date;
  expirationDate?: string | Date;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  experienceLevel?: string;
  industry?: string;
};

/**
 * Normalized job type for DB insertion (matches jobs schema, minus id/timestamps)
 */
export type NormalizedJob = {
  sourceId: string;
  sourceName: string;
  title: string;
  companyName: string;
  location: JobLocation;
  isRemote?: boolean;
  description: string;
  url?: string;
  postedDate?: Date;
  expirationDate?: Date;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  experienceLevel?: string;
  skills: string[];
  industry?: string;
  normalizedCompanyName: string;
};

/**
 * Ingests and normalizes a raw job input, returning a NormalizedJob object.
 * Does not insert into DB—prepares for insertion.
 */
export const ingestJob = (raw: RawJobInput): NormalizedJob => {
  // Clean and normalize fields
  const title = normalizeCase(cleanWhitespace(raw.title));
  const companyName = normalizeCase(cleanWhitespace(raw.companyName));
  let normalizedCompanyName =
    removeSpecialCharacters(companyName).toLowerCase();
  normalizedCompanyName = normalizedCompanyName.replace(/[.,;:!?]+$/, ''); // Remove trailing punctuation
  const location = normalizeLocation(raw.location);
  const description = cleanWhitespace(stripHtmlTags(raw.description));
  const skills = extractSkills(raw.title + ' ' + raw.description);

  return {
    sourceId: cleanWhitespace(raw.sourceId),
    sourceName: cleanWhitespace(raw.sourceName),
    title,
    companyName,
    location,
    isRemote: raw.isRemote,
    description,
    url: raw.url ? cleanWhitespace(raw.url) : undefined,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : undefined,
    expirationDate: raw.expirationDate
      ? new Date(raw.expirationDate)
      : undefined,
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    salaryCurrency: raw.salaryCurrency
      ? cleanWhitespace(raw.salaryCurrency)
      : undefined,
    jobType: raw.jobType ? cleanWhitespace(raw.jobType) : undefined,
    experienceLevel: raw.experienceLevel
      ? cleanWhitespace(raw.experienceLevel)
      : undefined,
    skills,
    industry: raw.industry ? cleanWhitespace(raw.industry) : undefined,
    normalizedCompanyName,
  };
};
