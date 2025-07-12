import axios from 'axios';
import { mapMuseJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

export const fetchMuseJobs = async (
  params: Record<string, unknown>
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  const apiKey = process.env.THE_MUSE_API_KEY;
  if (!apiKey) throw new Error('Missing THE_MUSE_API_KEY');
  const response = await axios.get('https://www.themuse.com/api/public/jobs', {
    params: { ...params, api_key: apiKey },
  });
  const jobs = Array.isArray(response.data.results)
    ? response.data.results
    : [];
  const totalCount =
    typeof response.data.total === 'number' ? response.data.total : 0;
  const page = typeof response.data.page === 'number' ? response.data.page : 1;
  const totalPages =
    typeof response.data.page_count === 'number' ? response.data.page_count : 1;
  return {
    jobs: jobs.map(mapMuseJobToInternal),
    totalCount,
    totalPages,
    page,
  };
};
