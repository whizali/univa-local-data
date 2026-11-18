import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Use the connection strings from .env.local
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function checkDB() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    // Check users
    const usersResult = await client.query('SELECT id, username, name FROM users ORDER BY id');
    console.log('\nExisting users:');
    console.log(usersResult.rows);
    
    // Check universities
    const universitiesResult = await client.query('SELECT COUNT(*) as count FROM universities');
    console.log('\nUniversities count:', universitiesResult.rows[0].count);
    
    // Check programs
    const programsResult = await client.query('SELECT COUNT(*) as count FROM programs');
    console.log('Programs count:', programsResult.rows[0].count);
    
    // Check merit formulas
    const formulasResult = await client.query('SELECT COUNT(*) as count FROM merit_formulas');
    console.log('Merit formulas count:', formulasResult.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkDB();
