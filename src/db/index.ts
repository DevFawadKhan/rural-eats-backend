import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();
process.env.TZ = process.env.APP_TIMEZONE || 'Asia/Karachi';

// Load CA certificate (Aiven SSL)
const caCert = process.env.DB_CA?.replace(/\\n/g, '\n');
console.log('DATABASE_URL', process.env.DATABASE_URL);
const isLocal = process.env.DATABASE_URL?.includes('localhost');

// Create a PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isLocal ? {} : {
    ssl: {
      ca: caCert,
      rejectUnauthorized: false,
    }
  }),
});

// Initialize and export the Drizzle instance with the schema
export const db = drizzle(pool, { schema });
