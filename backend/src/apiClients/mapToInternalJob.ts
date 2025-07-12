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

// The Muse API job mapping
export const mapMuseJobToInternal = (
  job: Record<string, unknown>
): NormalizedJob => {
  const title = normalizeCase(cleanWhitespace(String(job.name || '')));
  const companyName = normalizeCase(
    cleanWhitespace(
      String(
        (job.company && (job.company as Record<string, unknown>).name) || ''
      )
    )
  );
  const normalizedCompanyName = companyName.toLowerCase();
  // Use first location if available
  const locations = Array.isArray(job.locations) ? job.locations : [];
  const locationString =
    locations.length > 0 && typeof locations[0].name === 'string'
      ? locations[0].name
      : '';
  const location = normalizeLocation(locationString);
  const description = cleanWhitespace(String(job.contents || ''));
  const url =
    job.refs && typeof job.refs === 'object'
      ? ((job.refs as Record<string, unknown>).landing_page as string) || ''
      : '';
  const postedDate = job.publication_date
    ? new Date(String(job.publication_date))
    : undefined;
  // Parse salary if present (format varies)
  let salaryMin: number | undefined = undefined;
  let salaryMax: number | undefined = undefined;
  let salaryCurrency: string | undefined = undefined;
  if (job.salary && typeof job.salary === 'string') {
    // Example: "$80,000 - $120,000 USD"
    const match = job.salary.match(
      /\$([\d,]+)(?:\s*-\s*\$([\d,]+))?\s*([A-Z]{3})?/i
    );
    if (match) {
      salaryMin = match[1] ? Number(match[1].replace(/,/g, '')) : undefined;
      salaryMax = match[2] ? Number(match[2].replace(/,/g, '')) : undefined;
      salaryCurrency = match[3] || undefined;
    }
  }
  const jobType = job.type ? String(job.type) : undefined;
  const levels = Array.isArray(job.levels) ? job.levels : [];
  const experienceLevel =
    levels.length > 0 && typeof levels[0].name === 'string'
      ? levels[0].name
      : undefined;
  const skills = Array.isArray(job.skills)
    ? (job.skills as Record<string, unknown>[])
        .map((s) => (typeof s.name === 'string' ? s.name : ''))
        .filter(Boolean)
    : extractSkills(title + ' ' + description);
  const categories = Array.isArray(job.categories) ? job.categories : [];
  const industry =
    categories.length > 0 && typeof categories[0].name === 'string'
      ? categories[0].name
      : undefined;
  const isRemote = locationString.toLowerCase().includes('remote');

  return {
    sourceId: String(job.id),
    sourceName: 'The Muse',
    title,
    companyName,
    location,
    isRemote,
    description,
    url,
    postedDate,
    expirationDate: undefined,
    salaryMin,
    salaryMax,
    salaryCurrency,
    jobType,
    experienceLevel,
    skills,
    industry,
    normalizedCompanyName,
  };
};
