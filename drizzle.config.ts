import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Load CA certificate (Aiven SSL)
const caCert = process.env.DB_CA?.replace(/\\n/g, '\n');

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: {
      ca: caCert,
      rejectUnauthorized: false,
    },
  },
});
