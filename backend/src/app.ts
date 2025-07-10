import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchJoobleJobs } from './apiClients/joobleClient';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Jooble jobs endpoint (simple default query)
app.get('/api/jobs/jooble', async (req: Request, res: Response) => {
  try {
    // You can extend this to accept query params from req.query
    const jobs = await fetchJoobleJobs({ keywords: 'developer', page: 1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching Jooble jobs:', error);
    res.status(500).json({ error: 'Failed to fetch Jooble jobs' });
  }
});

export default app;
