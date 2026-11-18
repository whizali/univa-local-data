import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const conn = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function test() {
  const client = new pg.Client({ connectionString: conn });
  
  const start = Date.now();
  await client.connect();
  console.log(`Connect: ${Date.now() - start}ms`);
  
  const t1 = Date.now();
  await client.query('SELECT 1');
  console.log(`Query: ${Date.now() - t1}ms`);
  
  await client.end();
  console.log(`Total: ${Date.now() - start}ms`);
}

test().catch(console.error);
