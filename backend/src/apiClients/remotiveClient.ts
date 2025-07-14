// Remotive API legal/rate limit notice:
// - Endpoint: https://remotive.com/api/remote-jobs (remotive.io is deprecated)
// - Do not fetch more than 4x/day (cache for 6 hours)
// - Always attribute jobs to Remotive and link to their URL
// - Do not submit Remotive jobs to other job boards or use for email collection
//   See: https://remotive.com/api-documentation

import axios, { AxiosError } from 'axios';
import { mapRemotiveJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

// In-memory cache for Remotive jobs
let cachedJobs: NormalizedJob[] | null = null;
let cachedTotalCount: number = 0;
let cachedTimestamp: number = 0;

export const fetchRemotiveJobs = async (
  params: Record<string, unknown> = {}
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  const now = Date.now();
  // Only cache if no params (i.e., full fetch)
  const isCacheable = Object.keys(params).length === 0;
  if (
    isCacheable &&
    cachedJobs &&
    cachedTimestamp &&
    now - cachedTimestamp < CACHE_DURATION_MS
  ) {
    return {
      jobs: cachedJobs,
      totalCount: cachedTotalCount,
      totalPages: 1,
      page: 1,
    };
  }
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.get('https://remotive.com/api/remote-jobs', {
        params,
      });
      const jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
      const totalCount = jobs.length;
      const normalizedJobs = jobs.map(mapRemotiveJobToInternal);
      if (isCacheable) {
        cachedJobs = normalizedJobs;
        cachedTotalCount = totalCount;
        cachedTimestamp = now;
      }
      return {
        jobs: normalizedJobs,
        totalCount,
        totalPages: 1,
        page: 1,
      };
    } catch (error: unknown) {
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status === 429 &&
        attempt < MAX_RETRIES - 1
      ) {
        await new Promise((res) =>
          setTimeout(res, RETRY_DELAY_MS * (attempt + 1))
        );
        attempt++;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to fetch Remotive jobs after retries');
};
