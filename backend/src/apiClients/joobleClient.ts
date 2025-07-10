import axios from 'axios';

export const fetchJoobleJobs = async (params: Record<string, unknown>) => {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) throw new Error('Missing JOOBLE_API_KEY');
  const response = await axios.post(`https://jooble.org/api/${apiKey}`, params);
  // TODO: Map response to internal job schema
  return response.data.jobs;
};
