import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchJoobleJobs } from './apiClients/joobleClient';
import { fetchMuseJobs } from './apiClients/theMuseClient';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 60 requests per 10 minutes per IP
const joobleLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

/**
 * GET /api/jobs/jooble
 * Query params:
 *   keywords: string (job title/keywords)
 *   location: string (location/city/state/country)
 *   page: number (pagination, default 1)
 */
app.get(
  '/api/jobs/jooble',
  joobleLimiter,
  async (req: Request, res: Response) => {
    try {
      const keywords =
        typeof req.query.keywords === 'string'
          ? req.query.keywords
          : 'developer';
      const location =
        typeof req.query.location === 'string' ? req.query.location : '';
      const page = req.query.page ? Number(req.query.page) : 1;
      const { jobs } = await fetchJoobleJobs({
        keywords,
        location,
        page,
      });

      // Strict filter: all keywords must be in BOTH title and description
      const keywordList = keywords
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      let filteredJobs = jobs.filter((job) => {
        const title = (job.title || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        return keywordList.every(
          (kw) => title.includes(kw) && description.includes(kw)
        );
      });

      // Experience filter
      const experience =
        typeof req.query.experience === 'string' ? req.query.experience : '';
      if (experience) {
        filteredJobs = filteredJobs.filter((job) => {
          const text = (
            (job.title || '') +
            ' ' +
            (job.description || '')
          ).toLowerCase();
          if (experience === '0') {
            return (
              text.includes('0 years') ||
              text.includes('no experience') ||
              text.includes('entry level')
            );
          }
          if (experience === '<3') {
            // Match 0, 1, 2 years
            return (
              text.includes('0 years') ||
              text.includes('1 year') ||
              text.includes('2 years') ||
              text.includes('no experience') ||
              text.includes('entry level')
            );
          }
          if (experience === '3-5') {
            return (
              /3\s*years/.test(text) ||
              /4\s*years/.test(text) ||
              /5\s*years/.test(text) ||
              text.includes('3-5 years')
            );
          }
          if (experience === '5+') {
            return (
              /([5-9]|1[0-9])\s*\+?\s*years/.test(text) ||
              text.includes('5+ years')
            );
          }
          return true;
        });
      }

      // Salary range filter
      const minSalary = req.query.minSalary
        ? Number(req.query.minSalary)
        : undefined;
      const maxSalary = req.query.maxSalary
        ? Number(req.query.maxSalary)
        : undefined;
      if (minSalary !== undefined || maxSalary !== undefined) {
        filteredJobs = filteredJobs.filter((job) => {
          // Only consider jobs with at least one salary value
          if (
            typeof job.salaryMin !== 'number' &&
            typeof job.salaryMax !== 'number'
          )
            return false;
          if (minSalary !== undefined) {
            if (
              typeof job.salaryMin === 'number' &&
              job.salaryMin < minSalary &&
              typeof job.salaryMax === 'number' &&
              job.salaryMax < minSalary
            ) {
              return false;
            }
          }
          if (maxSalary !== undefined) {
            if (
              typeof job.salaryMin === 'number' &&
              job.salaryMin > maxSalary &&
              typeof job.salaryMax === 'number' &&
              job.salaryMax > maxSalary
            ) {
              return false;
            }
          }
          return true;
        });
      }

      res.json({
        jobs: filteredJobs,
        totalCount: filteredJobs.length,
        totalPages: Math.max(1, Math.ceil(filteredJobs.length / 20)),
        page,
      });
    } catch (error) {
      console.error('Error fetching Jooble jobs:', error);
      res.status(500).json({ error: 'Failed to fetch Jooble jobs' });
    }
  }
);

/**
 * GET /api/jobs/muse
 * Query params:
 *   keywords: string (job title/keywords)
 *   location: string (location/city/state/country)
 *   page: number (pagination, default 1)
 *   experience: string (0, <3, 3-5, 5+)
 *   minSalary: number
 *   maxSalary: number
 */
app.get('/api/jobs/muse', async (req: Request, res: Response) => {
  try {
    const keywords =
      typeof req.query.keywords === 'string' ? req.query.keywords : 'developer';
    const location =
      typeof req.query.location === 'string' ? req.query.location : '';
    const page = req.query.page ? Number(req.query.page) : 1;
    const { jobs } = await fetchMuseJobs({
      page,
      location,
      q: keywords,
    });

    // Strict filter: all keywords must be in BOTH title and description
    const keywordList = keywords
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    let filteredJobs = jobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const description = (job.description || '').toLowerCase();
      return keywordList.every(
        (kw) => title.includes(kw) && description.includes(kw)
      );
    });

    // Experience filter
    const experience =
      typeof req.query.experience === 'string' ? req.query.experience : '';
    if (experience) {
      filteredJobs = filteredJobs.filter((job) => {
        const text = (
          (job.title || '') +
          ' ' +
          (job.description || '')
        ).toLowerCase();
        if (experience === '0') {
          return (
            text.includes('0 years') ||
            text.includes('no experience') ||
            text.includes('entry level')
          );
        }
        if (experience === '<3') {
          // Match 0, 1, 2 years
          return (
            text.includes('0 years') ||
            text.includes('1 year') ||
            text.includes('2 years') ||
            text.includes('no experience') ||
            text.includes('entry level')
          );
        }
        if (experience === '3-5') {
          return (
            /3\s*years/.test(text) ||
            /4\s*years/.test(text) ||
            /5\s*years/.test(text) ||
            text.includes('3-5 years')
          );
        }
        if (experience === '5+') {
          return (
            /([5-9]|1[0-9])\s*\+?\s*years/.test(text) ||
            text.includes('5+ years')
          );
        }
        return true;
      });
    }

    // Salary range filter
    const minSalary = req.query.minSalary
      ? Number(req.query.minSalary)
      : undefined;
    const maxSalary = req.query.maxSalary
      ? Number(req.query.maxSalary)
      : undefined;
    if (minSalary !== undefined || maxSalary !== undefined) {
      filteredJobs = filteredJobs.filter((job) => {
        // Only consider jobs with at least one salary value
        if (
          typeof job.salaryMin !== 'number' &&
          typeof job.salaryMax !== 'number'
        )
          return false;
        if (minSalary !== undefined) {
          if (
            typeof job.salaryMin === 'number' &&
            job.salaryMin < minSalary &&
            typeof job.salaryMax === 'number' &&
            job.salaryMax < minSalary
          ) {
            return false;
          }
        }
        if (maxSalary !== undefined) {
          if (
            typeof job.salaryMin === 'number' &&
            job.salaryMin > maxSalary &&
            typeof job.salaryMax === 'number' &&
            job.salaryMax > maxSalary
          ) {
            return false;
          }
        }
        return true;
      });
    }

    res.json({
      jobs: filteredJobs,
      totalCount: filteredJobs.length,
      totalPages: Math.max(1, Math.ceil(filteredJobs.length / 20)),
      page,
    });
  } catch (error) {
    console.error('Error fetching Muse jobs:', error);
    res.status(500).json({ error: 'Failed to fetch Muse jobs' });
  }
});

/**
 * GET /api/jobs/combined
 * Query params:
 *   keywords: string (job title/keywords)
 *   location: string (location/city/state/country)
 *   page: number (pagination, default 1)
 *   experience: string (0, <3, 3-5, 5+)
 *   minSalary: number
 *   maxSalary: number
 *   pageSize: number (default 20)
 */
app.get('/api/jobs/combined', async (req: Request, res: Response) => {
  try {
    const keywords =
      typeof req.query.keywords === 'string' ? req.query.keywords : 'developer';
    const location =
      typeof req.query.location === 'string' ? req.query.location : '';
    const page = req.query.page ? Number(req.query.page) : 1;
    const experience =
      typeof req.query.experience === 'string' ? req.query.experience : '';
    const minSalary = req.query.minSalary
      ? Number(req.query.minSalary)
      : undefined;
    const maxSalary = req.query.maxSalary
      ? Number(req.query.maxSalary)
      : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    // Fetch from all sources in parallel
    const [jooble, muse] = await Promise.all([
      fetchJoobleJobs({ keywords, location, page: 1 }),
      fetchMuseJobs({ q: keywords, location, page: 1 }),
    ]);
    let allJobs = [...jooble.jobs, ...muse.jobs];

    // Strict filter: all keywords must be in BOTH title and description
    const keywordList = keywords
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (keywordList.length > 0) {
      allJobs = allJobs.filter((job) => {
        const title = (job.title || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        return keywordList.every(
          (kw) => title.includes(kw) && description.includes(kw)
        );
      });
    }

    // Experience filter
    if (experience) {
      allJobs = allJobs.filter((job) => {
        const text = (
          (job.title || '') +
          ' ' +
          (job.description || '')
        ).toLowerCase();
        if (experience === '0') {
          return (
            text.includes('0 years') ||
            text.includes('no experience') ||
            text.includes('entry level')
          );
        }
        if (experience === '<3') {
          return (
            text.includes('0 years') ||
            text.includes('1 year') ||
            text.includes('2 years') ||
            text.includes('no experience') ||
            text.includes('entry level')
          );
        }
        if (experience === '3-5') {
          return (
            /3\s*years/.test(text) ||
            /4\s*years/.test(text) ||
            /5\s*years/.test(text) ||
            text.includes('3-5 years')
          );
        }
        if (experience === '5+') {
          return (
            /([5-9]|1[0-9])\s*\+?\s*years/.test(text) ||
            text.includes('5+ years')
          );
        }
        return true;
      });
    }

    // Salary range filter
    if (minSalary !== undefined || maxSalary !== undefined) {
      allJobs = allJobs.filter((job) => {
        if (
          typeof job.salaryMin !== 'number' &&
          typeof job.salaryMax !== 'number'
        )
          return false;
        if (minSalary !== undefined) {
          if (
            typeof job.salaryMin === 'number' &&
            job.salaryMin < minSalary &&
            typeof job.salaryMax === 'number' &&
            job.salaryMax < minSalary
          ) {
            return false;
          }
        }
        if (maxSalary !== undefined) {
          if (
            typeof job.salaryMin === 'number' &&
            job.salaryMin > maxSalary &&
            typeof job.salaryMax === 'number' &&
            job.salaryMax > maxSalary
          ) {
            return false;
          }
        }
        return true;
      });
    }

    // Sort by postedDate descending (most recent first)
    allJobs.sort((a, b) => {
      const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
      const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
      return dateB - dateA;
    });

    // Pagination
    const totalCount = allJobs.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginatedJobs = allJobs.slice((page - 1) * pageSize, page * pageSize);

    res.json({
      jobs: paginatedJobs,
      totalCount,
      totalPages,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching combined jobs:', error);
    res.status(500).json({ error: 'Failed to fetch combined jobs' });
  }
});

export default app;
