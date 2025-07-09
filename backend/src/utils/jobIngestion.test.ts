import { ingestJob, RawJobInput } from './jobIngestion';

describe('ingestJob', () => {
  test('normalizes and extracts all fields from raw job input', () => {
    const raw: RawJobInput = {
      sourceId: ' 12345 ',
      sourceName: ' Indeed ',
      title: 'senior REACT.JS developer',
      companyName: '  ACME corp. ',
      location: 'San Francisco, CA, USA',
      isRemote: true,
      description:
        '<p>Looking for a React.js/JS/Node.js engineer. Must know HTML & CSS.</p>',
      url: ' https://indeed.com/job/12345 ',
      postedDate: '2024-05-01',
      expirationDate: '2024-06-01',
      salaryMin: 120000,
      salaryMax: 150000,
      salaryCurrency: ' usd ',
      jobType: ' full-time ',
      experienceLevel: ' senior ',
      industry: ' tech ',
    };
    const normalized = ingestJob(raw);
    expect(normalized).toEqual({
      sourceId: '12345',
      sourceName: 'Indeed',
      title: 'Senior React.Js Developer',
      companyName: 'Acme Corp.',
      location: { city: 'San Francisco', state: 'California', country: 'USA' },
      isRemote: true,
      description:
        'Looking for a React.js/JS/Node.js engineer. Must know HTML & CSS.',
      url: 'https://indeed.com/job/12345',
      postedDate: new Date('2024-05-01'),
      expirationDate: new Date('2024-06-01'),
      salaryMin: 120000,
      salaryMax: 150000,
      salaryCurrency: 'usd',
      jobType: 'full-time',
      experienceLevel: 'senior',
      skills: ['CSS', 'HTML', 'JavaScript', 'Node.js', 'React'],
      industry: 'tech',
      normalizedCompanyName: 'acme corp',
    });
  });
});
