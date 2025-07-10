import axios from 'axios';

export const fetchMuseJobs = async (params: Record<string, unknown>) => {
  const apiKey = process.env.THE_MUSE_API_KEY;
  if (!apiKey) throw new Error('Missing THE_MUSE_API_KEY');
  const response = await axios.get('https://www.themuse.com/api/public/jobs', {
    params: { ...params, api_key: apiKey },
  });
  // TODO: Map response to internal job schema
  return response.data.results;
};
