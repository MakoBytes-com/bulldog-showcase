import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const m = env.match(/DATABASE_URI="?([^\n"]+)"?/);
if (!m) { console.error('no DATABASE_URI'); process.exit(1); }
const sql = neon(m[1]);

const rows = await sql`
  SELECT name, status, raw_count, inserted_count, updated_count, elapsed_ms,
         started_at, finished_at, error_message
  FROM cron_runs
  ORDER BY finished_at DESC
  LIMIT 20;
`;
console.log('CRON_RUNS (latest 20):');
console.table(rows);

const latestPerName = await sql`
  SELECT DISTINCT ON (name) name, status, raw_count, inserted_count, updated_count, finished_at
  FROM cron_runs
  ORDER BY name, finished_at DESC;
`;
console.log('\nLATEST PER CRON:');
console.table(latestPerName);
