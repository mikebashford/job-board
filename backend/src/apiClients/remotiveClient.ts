import axios, { AxiosError } from 'axios';
import { mapRemotiveJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const fetchRemotiveJobs = async (
  params: Record<string, unknown> = {}
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.get('https://remotive.com/api/remote-jobs', {
        params,
      });
      const jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
      const totalCount = jobs.length;
      return {
        jobs: jobs.map(mapRemotiveJobToInternal),
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
