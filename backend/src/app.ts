import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchJoobleJobs } from './apiClients/joobleClient';
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
      const { jobs, totalCount, totalPages } = await fetchJoobleJobs({
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
      const filteredJobs = jobs.filter((job) => {
        const title = (job.title || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        return keywordList.every(
          (kw) => title.includes(kw) && description.includes(kw)
        );
      });

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

export default app;
