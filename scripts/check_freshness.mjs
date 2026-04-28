import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const m = env.match(/DATABASE_URI="?([^\n"]+)"?/);
if (!m) { console.error('no DATABASE_URI'); process.exit(1); }
const sql = neon(m[1]);

const res1 = await sql`
  SELECT source,
         MAX(scraped_at) AS last_scraped,
         COUNT(*) FILTER (WHERE scraped_at > now() - interval '24 hours') AS new_24h,
         COUNT(*) FILTER (WHERE scraped_at > now() - interval '48 hours') AS new_48h,
         COUNT(*) FILTER (WHERE scraped_at > now() - interval '7 days') AS new_7d,
         COUNT(*) AS total
  FROM sales_leads
  GROUP BY source
  ORDER BY source;
`;
console.log('SALES LEADS:');
console.table(res1);

const res2 = await sql`
  SELECT MAX(scraped_at) AS last_scraped, COUNT(*) AS total
  FROM competitor_intel;
`;
console.log('COMPETITOR INTEL:');
console.table(res2);

const res3 = await sql`SELECT now() AS db_now;`;
console.log('DB NOW:', res3[0].db_now);

// Check error_events table for cron errors
try {
  const errs = await sql`
    SELECT level, source, message, COUNT(*) AS count, MAX(created_at) AS last_seen
    FROM error_events
    WHERE source LIKE 'cron/%' AND created_at > now() - interval '7 days'
    GROUP BY level, source, message
    ORDER BY last_seen DESC
    LIMIT 20;
  `;
  console.log('CRON ERRORS (last 7d):');
  console.table(errs);
} catch (e) {
  console.log('error_events table issue:', e.message);
}
