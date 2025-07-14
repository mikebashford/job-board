import {
  ingestAdzunaJobs,
  ingestRemotiveJobs,
  ingestUsaJobs,
} from './jobIngestionService';
import * as adzunaClient from '../apiClients/adzunaClient';
import * as remotiveClient from '../apiClients/remotiveClient';
import * as usaJobsClient from '../apiClients/usaJobsClient';

jest.mock('../apiClients/adzunaClient');
jest.mock('../apiClients/remotiveClient');
jest.mock('../apiClients/usaJobsClient');

describe('jobIngestionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ingestAdzunaJobs', () => {
    it('returns normalized jobs and meta info', async () => {
      (adzunaClient.fetchAdzunaJobs as jest.Mock).mockResolvedValue({
        jobs: [
          {
            sourceId: '1',
            title: 'Test',
            companyName: 'A',
            location: {},
            description: '',
            sourceName: 'Adzuna',
            skills: [],
            normalizedCompanyName: 'a',
          },
        ],
        totalCount: 1,
        totalPages: 1,
        page: 1,
      });
      const result = await ingestAdzunaJobs({ q: 'test' });
      expect(result.jobs).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
    });
    it('handles API errors', async () => {
      (adzunaClient.fetchAdzunaJobs as jest.Mock).mockRejectedValue(
        new Error('API error')
      );
      await expect(ingestAdzunaJobs({ q: 'fail' })).rejects.toThrow(
        'API error'
      );
    });
  });

  describe('ingestRemotiveJobs', () => {
    it('returns normalized jobs and meta info', async () => {
      (remotiveClient.fetchRemotiveJobs as jest.Mock).mockResolvedValue({
        jobs: [
          {
            sourceId: '2',
            title: 'Remote',
            companyName: 'B',
            location: {},
            description: '',
            sourceName: 'Remotive',
            skills: [],
            normalizedCompanyName: 'b',
          },
        ],
        totalCount: 1,
        totalPages: 1,
        page: 1,
      });
      const result = await ingestRemotiveJobs({ search: 'remote' });
      expect(result.jobs).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
    });
    it('handles API errors', async () => {
      (remotiveClient.fetchRemotiveJobs as jest.Mock).mockRejectedValue(
        new Error('API error')
      );
      await expect(ingestRemotiveJobs({ search: 'fail' })).rejects.toThrow(
        'API error'
      );
    });
  });

  describe('ingestUsaJobs', () => {
    it('returns normalized jobs and meta info', async () => {
      (usaJobsClient.fetchUsaJobs as jest.Mock).mockResolvedValue({
        jobs: [
          {
            sourceId: '3',
            title: 'USA',
            companyName: 'C',
            location: {},
            description: '',
            sourceName: 'USA Jobs',
            skills: [],
            normalizedCompanyName: 'c',
          },
        ],
        totalCount: 1,
        totalPages: 1,
        page: 1,
      });
      const result = await ingestUsaJobs({ keyword: 'usa' });
      expect(result.jobs).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
    });
    it('handles API errors', async () => {
      (usaJobsClient.fetchUsaJobs as jest.Mock).mockRejectedValue(
        new Error('API error')
      );
      await expect(ingestUsaJobs({ keyword: 'fail' })).rejects.toThrow(
        'API error'
      );
    });
  });
});
