import axios from 'axios';
import { mapJoobleJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

export const fetchJoobleJobs = async (
  params: Record<string, unknown>
): Promise<{
  jobs: NormalizedJob[];
  totalCount: number;
  totalPages: number;
  page: number;
}> => {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) throw new Error('Missing JOOBLE_API_KEY');
  const response = await axios.post(`https://jooble.org/api/${apiKey}`, params);
  const jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
  const totalCount =
    typeof response.data.totalCount === 'number'
      ? response.data.totalCount
      : typeof response.data.total === 'number'
        ? response.data.total
        : 0;
  const page =
    typeof params.page === 'number'
      ? params.page
      : typeof params.page === 'string'
        ? parseInt(params.page, 10)
        : 1;
  const jobsPerPage = 20;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / jobsPerPage) : 1;
  return {
    jobs: jobs.map(mapJoobleJobToInternal),
    totalCount,
    totalPages,
    page,
  };
};
