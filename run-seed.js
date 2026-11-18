import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const { Client } = pg;

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function runSeed() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    console.log('Reading seed-data.sql...');
    let seedSQL = fs.readFileSync('seed-data.sql', 'utf8');
    
    // Check if users exist and get the first user's ID
    const usersResult = await client.query('SELECT id FROM users ORDER BY id LIMIT 1');
    
    let userIdToUse = 1;
    if (usersResult.rows.length > 0) {
      userIdToUse = usersResult.rows[0].id;
      console.log(`Using existing user ID: ${userIdToUse}`);
      
      // Replace all instances of ", 1)" in the universities/programs inserts with the actual user ID
      // This targets the updated_by column
      seedSQL = seedSQL.replace(/,\s*1\)(?=\s*,?\s*$)/gm, `, ${userIdToUse})`);
      seedSQL = seedSQL.replace(/, 1\)/g, `, ${userIdToUse})`);
    }
    
    console.log('Executing seed SQL against production database...');
    console.log('This may take a few minutes...');
    
    // Execute the entire SQL
    await client.query(seedSQL);
    
    console.log('\n✓ Seed execution complete!');
    console.log('Database seeded successfully!');
    
    // Show final counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM universities) as universities,
        (SELECT COUNT(*) FROM programs) as programs,
        (SELECT COUNT(*) FROM merit_formulas) as merit_formulas
    `);
    console.log('\nFinal database counts:');
    console.log(counts.rows[0]);
    
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();
