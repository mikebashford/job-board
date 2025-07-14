import { fetchAdzunaJobs } from '../apiClients/adzunaClient';
import { fetchRemotiveJobs } from '../apiClients/remotiveClient';
import { fetchUsaJobs } from '../apiClients/usaJobsClient';
import type { NormalizedJob } from '../utils/jobIngestion';

/**
 * Ingest jobs from Adzuna API
 * @param params Query parameters for Adzuna API
 * @returns Normalized jobs and meta info
 */
export const ingestAdzunaJobs = async (
  params: Record<string, unknown>
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  return fetchAdzunaJobs(params);
};

/**
 * Ingest jobs from Remotive API
 * @param params Query parameters for Remotive API
 * @returns Normalized jobs and meta info
 */
export const ingestRemotiveJobs = async (
  params: Record<string, unknown> = {}
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  return fetchRemotiveJobs(params);
};

/**
 * Ingest jobs from USA Jobs API
 * @param params Query parameters for USA Jobs API
 * @returns Normalized jobs and meta info
 */
export const ingestUsaJobs = async (
  params: Record<string, unknown>
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  return fetchUsaJobs(params);
};

// Add additional ingestion functions for other sources as needed.
