import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

import * as fs from 'fs';
import * as path from 'path';

// Load CA certificate (Aiven SSL)
const caCert = fs.readFileSync(path.join(process.cwd(), 'ca.pem')).toString();

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
