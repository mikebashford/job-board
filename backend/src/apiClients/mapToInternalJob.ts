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

// Adzuna API job mapping
export const mapAdzunaJobToInternal = (
  job: Record<string, unknown>
): NormalizedJob => {
  // Adzuna job fields: id, title, company.display_name, location.display_name, description, redirect_url, created, salary_min, salary_max, salary_currency, contract_type, category.label
  const title = normalizeCase(cleanWhitespace(String(job.title)));
  const companyName = normalizeCase(
    cleanWhitespace(
      job.company &&
        typeof job.company === 'object' &&
        'display_name' in job.company
        ? String((job.company as Record<string, unknown>).display_name)
        : ''
    )
  );
  const normalizedCompanyName = companyName.toLowerCase();
  const location = normalizeLocation(
    job.location &&
      typeof job.location === 'object' &&
      'display_name' in job.location
      ? String((job.location as Record<string, unknown>).display_name)
      : ''
  );
  const description = cleanWhitespace(String(job.description || ''));
  const skills = extractSkills(title + ' ' + description);
  const url = String(job.redirect_url || '');
  const postedDate = job.created ? new Date(String(job.created)) : undefined;
  const salaryMin =
    typeof job.salary_min === 'number' ? job.salary_min : undefined;
  const salaryMax =
    typeof job.salary_max === 'number' ? job.salary_max : undefined;
  const salaryCurrency = job.salary_currency
    ? String(job.salary_currency)
    : undefined;
  const jobType = job.contract_type ? String(job.contract_type) : undefined;
  const experienceLevel = undefined; // Adzuna does not provide
  const industry =
    job.category && typeof job.category === 'object' && 'label' in job.category
      ? String((job.category as Record<string, unknown>).label)
      : undefined;
  const isRemote = typeof job.remote === 'boolean' ? job.remote : false;

  return {
    sourceId: job.id ? String(job.id) : '',
    sourceName: 'Adzuna',
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

// Remotive API mapping: Must attribute jobs to Remotive and link to their URL. See https://remotive.com/api-documentation
export const mapRemotiveJobToInternal = (
  job: Record<string, unknown>
): NormalizedJob => {
  // Remotive job fields: id, title, company_name, candidate_required_location, description, url, publication_date, salary, job_type
  const title = normalizeCase(cleanWhitespace(String(job.title)));
  const companyName = normalizeCase(cleanWhitespace(String(job.company_name)));
  const normalizedCompanyName = companyName.toLowerCase();
  const location = normalizeLocation(
    String(job.candidate_required_location || '')
  );
  const description = cleanWhitespace(String(job.description || ''));
  const skills = extractSkills(title + ' ' + description);
  const url = String(job.url || '');
  const postedDate = job.publication_date
    ? new Date(String(job.publication_date))
    : undefined;
  // Remotive salary is a string, e.g., "$80,000 - $120,000 USD"
  let salaryMin: number | undefined = undefined;
  let salaryMax: number | undefined = undefined;
  let salaryCurrency: string | undefined = undefined;
  if (job.salary && typeof job.salary === 'string') {
    const match = job.salary.match(
      /\$([\d,]+)(?:\s*-\s*\$([\d,]+))?\s*([A-Z]{3})?/i
    );
    if (match) {
      salaryMin = match[1] ? Number(match[1].replace(/,/g, '')) : undefined;
      salaryMax = match[2] ? Number(match[2].replace(/,/g, '')) : undefined;
      salaryCurrency = match[3] || undefined;
    }
  }
  const jobType = job.job_type ? String(job.job_type) : undefined;
  const experienceLevel = undefined; // Remotive does not provide
  const industry = job.category ? String(job.category) : undefined;
  const isRemote = true; // Remotive jobs are remote by default

  return {
    sourceId: job.id ? String(job.id) : '',
    sourceName: 'Remotive',
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

// USA Jobs API job mapping
// sourceId must be set to MatchedObjectId for deduplication and tracking
export const mapUsaJobsJobToInternal = (
  job: Record<string, unknown>
): NormalizedJob => {
  // USA Jobs job fields: MatchedObjectId, PositionTitle, OrganizationName, PositionLocation, PositionRemuneration, ApplyURI, PublicationStartDate
  const title = normalizeCase(cleanWhitespace(String(job.PositionTitle)));
  const companyName = normalizeCase(
    cleanWhitespace(String(job.OrganizationName))
  );
  const normalizedCompanyName = companyName.toLowerCase();
  // PositionLocation is an array; use first location
  const locations = Array.isArray(job.PositionLocation)
    ? job.PositionLocation
    : [];
  const locationString =
    locations.length > 0 && typeof locations[0].LocationName === 'string'
      ? locations[0].LocationName
      : '';
  const location = normalizeLocation(locationString);
  // Safely extract description from UserArea.Details.JobSummary
  let description = '';
  if (job.UserArea && typeof job.UserArea === 'object') {
    const userArea = job.UserArea as Record<string, unknown>;
    if (userArea.Details && typeof userArea.Details === 'object') {
      const details = userArea.Details as Record<string, unknown>;
      if ('JobSummary' in details) {
        description = cleanWhitespace(String(details.JobSummary || ''));
      }
    }
  }
  const skills = extractSkills(title + ' ' + description);
  // ApplyURI is an array; use first
  const url =
    Array.isArray(job.ApplyURI) && job.ApplyURI.length > 0
      ? String(job.ApplyURI[0])
      : '';
  const postedDate = job.PublicationStartDate
    ? new Date(String(job.PublicationStartDate))
    : undefined;
  // PositionRemuneration is an array; use first for min/max/currency
  let salaryMin: number | undefined = undefined;
  let salaryMax: number | undefined = undefined;
  let salaryCurrency: string | undefined = undefined;
  if (
    Array.isArray(job.PositionRemuneration) &&
    job.PositionRemuneration.length > 0
  ) {
    const rem = job.PositionRemuneration[0];
    if (rem && typeof rem.MinimumRange === 'string') {
      salaryMin = Number(rem.MinimumRange.replace(/,/g, ''));
    }
    if (rem && typeof rem.MaximumRange === 'string') {
      salaryMax = Number(rem.MaximumRange.replace(/,/g, ''));
    }
    if (rem && typeof rem.CurrencyCode === 'string') {
      salaryCurrency = rem.CurrencyCode;
    }
  }
  const jobType =
    job.PositionSchedule &&
    Array.isArray(job.PositionSchedule) &&
    job.PositionSchedule.length > 0 &&
    job.PositionSchedule[0].Name
      ? String(job.PositionSchedule[0].Name)
      : undefined;
  const experienceLevel = undefined; // Not provided
  const industry =
    job.JobCategory &&
    Array.isArray(job.JobCategory) &&
    job.JobCategory.length > 0 &&
    job.JobCategory[0].Name
      ? String(job.JobCategory[0].Name)
      : undefined;
  const isRemote = false; // Not directly provided

  return {
    sourceId: job.MatchedObjectId ? String(job.MatchedObjectId) : '',
    sourceName: 'USA Jobs',
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
