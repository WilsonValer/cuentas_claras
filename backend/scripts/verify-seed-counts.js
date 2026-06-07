require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const result = await client.query(`
    select
      (select count(*) from lunch_events) as events,
      (select count(*) from participants) as participants,
      (select count(*) from consumption_items) as items
  `);
  await client.end();

  console.log(result.rows[0]);
}

main().catch((error) => {
  console.error('Verify failed:', error.message);
  process.exit(1);
});
