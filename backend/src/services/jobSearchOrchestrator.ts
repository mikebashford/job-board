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

  // Adzuna: paginated, 50/page
  const adzunaPromise = fetchPaginated(ingestAdzunaJobs, 'q');
  // USA Jobs: paginated, 25/page
  const usaJobsPromise = fetchPaginated(ingestUsaJobs, 'Keyword');
  // Remotive: no pagination, fetch once
  const remotivePromise = ingestRemotiveJobs({ search: query }).then((res) =>
    res.jobs.slice(0, maxJobsPerSource)
  );

  // Run all in parallel
  const [adzunaJobs, usaJobs, remotiveJobs] = await Promise.all([
    adzunaPromise,
    usaJobsPromise,
    remotivePromise,
  ]);

  // Combine all jobs
  return [...adzunaJobs, ...usaJobs, ...remotiveJobs];
};
