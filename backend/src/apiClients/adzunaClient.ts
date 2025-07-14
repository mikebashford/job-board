import axios, { AxiosError } from 'axios';
import { mapAdzunaJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const fetchAdzunaJobs = async (
  params: Record<string, unknown>
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;
  if (!appId || !apiKey)
    throw new Error('Missing ADZUNA_APP_ID or ADZUNA_API_KEY');
  const page = typeof params.page === 'number' ? params.page : 1;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/us/search/${page}`,
        {
          params: { ...params, app_id: appId, app_key: apiKey, page },
        }
      );
      const jobs = Array.isArray(response.data.results)
        ? response.data.results
        : [];
      const totalCount =
        typeof response.data.count === 'number' ? response.data.count : 0;
      const jobsPerPage = 50; // Adzuna default
      const totalPages =
        totalCount > 0 ? Math.ceil(totalCount / jobsPerPage) : 1;
      return {
        jobs: jobs.map(mapAdzunaJobToInternal),
        totalCount,
        totalPages,
        page,
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
  throw new Error('Failed to fetch Adzuna jobs after retries');
};
