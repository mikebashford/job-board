import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' })
})

export default app
