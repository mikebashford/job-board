import axios from 'axios';
import { mapJoobleJobToInternal } from './mapToInternalJob';
import type { NormalizedJob } from '../utils/jobIngestion';

export const fetchJoobleJobs = async (
  params: Record<string, unknown>
): Promise<NormalizedJob[]> => {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) throw new Error('Missing JOOBLE_API_KEY');
  const response = await axios.post(`https://jooble.org/api/${apiKey}`, params);
  const jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
  return jobs.map(mapJoobleJobToInternal);
};
