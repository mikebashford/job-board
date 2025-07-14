import axios, { AxiosError } from 'axios';
import { mapUsaJobsJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const fetchUsaJobs = async (
  params: Record<string, unknown>
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  const apiKey = process.env.USA_JOBS_API_KEY;
  if (!apiKey) throw new Error('Missing USA_JOBS_API_KEY');
  const page = typeof params.Page === 'number' ? params.Page : 1;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.get('https://data.usajobs.gov/api/search', {
        headers: {
          'Authorization-Key': apiKey,
          'User-Agent': 'YourAppNameHere', // Replace with your app name or email
        },
        params: { ...params, Page: page },
      });
      const items = response.data.SearchResult?.SearchResultItems || [];
      const jobs = items.map((item: Record<string, unknown>) => {
        const descriptor = item.MatchedObjectDescriptor;
        const id = item.MatchedObjectId;
        if (descriptor && typeof descriptor === 'object') {
          return { ...descriptor, MatchedObjectId: id };
        }
        return { MatchedObjectId: id };
      });
      const totalCount = response.data.SearchResult?.SearchResultCountAll || 0;
      const jobsPerPage = 25; // USA Jobs default
      const totalPages =
        totalCount > 0 ? Math.ceil(totalCount / jobsPerPage) : 1;
      return {
        jobs: jobs.map(mapUsaJobsJobToInternal),
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
  throw new Error('Failed to fetch USA Jobs after retries');
};
