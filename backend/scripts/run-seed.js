const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runSeed() {
  const seedPath = path.resolve(__dirname, '../sql/seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  await client.query(sql);
  await client.end();
}

runSeed()
  .then(() => {
    console.log('Seed executed successfully.');
  })
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
