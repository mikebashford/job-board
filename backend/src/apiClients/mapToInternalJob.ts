import {
  cleanWhitespace,
  normalizeCase,
  normalizeLocation,
  extractSkills,
} from '../utils/dataCleaning';
import type { NormalizedJob } from '../utils/jobIngestion';

// Jooble API job mapping
export const mapJoobleJobToInternal = (
  job: Record<string, unknown>
): NormalizedJob => {
  // Jooble job fields: id, title, company, location, description, etc.
  // See: https://jooble.org/api/about for field reference
  const title = normalizeCase(cleanWhitespace(String(job.title)));
  const companyName = normalizeCase(cleanWhitespace(String(job.company)));
  const normalizedCompanyName = companyName.toLowerCase();
  const location = normalizeLocation(String(job.location));
  const description = cleanWhitespace(
    String(job.snippet || job.description || '')
  );
  const skills = extractSkills(
    String(job.title) + ' ' + String(job.snippet || job.description || '')
  );

  return {
    sourceId: job.id ? String(job.id) : '',
    sourceName: 'Jooble',
    title,
    companyName,
    location,
    isRemote: Boolean(job.remote),
    description,
    url: String(job.link || job.url || ''),
    postedDate: job.date ? new Date(String(job.date)) : undefined,
    expirationDate: undefined, // Jooble may not provide
    salaryMin: typeof job.salary_min === 'number' ? job.salary_min : undefined,
    salaryMax: typeof job.salary_max === 'number' ? job.salary_max : undefined,
    salaryCurrency: job.salary_currency
      ? String(job.salary_currency)
      : undefined,
    jobType: job.type ? String(job.type) : undefined,
    experienceLevel: job.experience ? String(job.experience) : undefined,
    skills,
    industry: job.category ? String(job.category) : undefined,
    normalizedCompanyName,
  };
};
