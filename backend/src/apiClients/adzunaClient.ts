import axios from 'axios';

export const fetchAdzunaJobs = async (params: Record<string, unknown>) => {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;
  if (!appId || !apiKey)
    throw new Error('Missing ADZUNA_APP_ID or ADZUNA_API_KEY');
  const response = await axios.get(
    `https://api.adzuna.com/v1/api/jobs/us/search/1`,
    {
      params: { ...params, app_id: appId, app_key: apiKey },
    }
  );
  // TODO: Map response to internal job schema
  return response.data.results;
};
