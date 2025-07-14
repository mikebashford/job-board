import {
  ingestAdzunaJobs,
  ingestRemotiveJobs,
  ingestUsaJobs,
} from './jobIngestionService';
import type { NormalizedJob } from '../utils/jobIngestion';

/**
 * Orchestrates job search across all sources, paginating each up to maxJobsPerSource.
 * @param query Search term
 * @param maxJobsPerSource Maximum jobs to fetch per source (default 1000)
 * @returns Combined array of jobs from all sources
 */
export const searchAllSources = async (
  query: string,
  maxJobsPerSource = 1000
): Promise<NormalizedJob[]> => {
  // Helper to fetch paginated jobs from a source
  const fetchPaginated = async (
    ingestFn: (
      params: Record<string, unknown>
    ) => Promise<{ jobs: NormalizedJob[]; totalPages: number; page: number }>,
    queryParam: string
  ) => {
    let jobs: NormalizedJob[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await ingestFn({ [queryParam]: query, page });
      jobs = jobs.concat(res.jobs);
      totalPages = res.totalPages;
      page++;
    } while (jobs.length < maxJobsPerSource && page <= totalPages);
    return jobs.slice(0, maxJobsPerSource);
  };

  // Add per-source error handling and logging
  const adzunaPromise = fetchPaginated(ingestAdzunaJobs, 'q').catch((e) => {
    console.error('Adzuna error:', e?.response?.data || e.message || e);
    return [];
  });
  const usaJobsPromise = fetchPaginated(ingestUsaJobs, 'Keyword').catch((e) => {
    console.error('USA Jobs error:', e?.response?.data || e.message || e);
    return [];
  });
  const remotivePromise = ingestRemotiveJobs({ search: query })
    .then((res) => res.jobs.slice(0, maxJobsPerSource))
    .catch((e) => {
      console.error('Remotive error:', e?.response?.data || e.message || e);
      return [];
    });

  const [adzunaJobs, usaJobs, remotiveJobs] = await Promise.all([
    adzunaPromise,
    usaJobsPromise,
    remotivePromise,
  ]);

  return [...adzunaJobs, ...usaJobs, ...remotiveJobs];
};
