import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';

const CONNECTION_TIMEOUT_MS = 30000;
const QUERY_TIMEOUT_MS = 10000;
const IDLE_TIMEOUT_MS = 300000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  statement_timeout: QUERY_TIMEOUT_MS,
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
  max: 20,
});

export const db = drizzle(pool, { schema });
