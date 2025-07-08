import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import type { Config } from 'drizzle-kit';

console.log('DEBUG: DATABASE_URL =', process.env.DATABASE_URL);

function parseDbUrl(url: string) {
  // Accept both postgres:// and postgresql://
  const match = url.match(
    /^postgres(?:ql)?:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)(\?.*)?$/
  );
  if (!match) throw new Error('Invalid DATABASE_URL');
  return {
    host: match[3],
    port: Number(match[4]),
    user: match[1],
    password: match[2],
    database: match[5],
    ssl: { rejectUnauthorized: false }, // Accept self-signed certs
  };
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in environment variables');
}

const dbCredentials = parseDbUrl(process.env.DATABASE_URL);

export default {
  schema: 'C:/Users/Mike/Repos/job-board/backend/src/db/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials,
} satisfies Config;
