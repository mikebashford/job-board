import axios from 'axios';

export const fetchRemotiveJobs = async (
  params: Record<string, unknown> = {}
) => {
  const response = await axios.get('https://remotive.com/api/remote-jobs', {
    params,
  });
  // TODO: Map response to internal job schema
  return response.data.jobs;
};
