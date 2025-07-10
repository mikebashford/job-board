import axios from 'axios';

export const fetchUsaJobs = async (params: Record<string, unknown>) => {
  const apiKey = process.env.USA_JOBS_API_KEY;
  if (!apiKey) throw new Error('Missing USA_JOBS_API_KEY');
  const response = await axios.get('https://data.usajobs.gov/api/search', {
    headers: {
      'Authorization-Key': apiKey,
      'User-Agent': 'YourAppNameHere', // Replace with your app name or email
    },
    params,
  });
  // TODO: Map response to internal job schema
  return response.data.SearchResult.SearchResultItems;
};
