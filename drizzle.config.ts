import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Load CA certificate (Aiven SSL)
const caCert = process.env.DB_CA?.replace(/\\n/g, '\n');
const dbUrl = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
