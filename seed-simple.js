import pg from 'pg';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

async function seedDatabase() {
  console.log('\n🌱 Seeding Production Database (Simple Method)...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  
  try {
    // Read seed file
    const seedSQL = await readFile('./seed-data.sql', 'utf8');
    console.log(`✓ Loaded seed file (${(seedSQL.length / 1024).toFixed(1)} KB)\n`);
    
    // Clean it - remove comments, fix line endings
    const cleanSQL = seedSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n');
    
    console.log('⏳ Executing seed script (may take 60-90 seconds)...\n');
    
    await pool.query(cleanSQL);
    
    console.log('✅ Seed executed!\n');
    
    // Verify
    console.log('📊 Verifying...\n');
    
    const [users, unis, progs] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM universities'),
      pool.query('SELECT COUNT(*) FROM programs')
    ]);
    
    console.log(`Users: ${users.rows[0].count}`);
    console.log(`Universities: ${unis.rows[0].count}`);
    console.log(`Programs: ${progs.rows[0].count}\n`);
    
    if (users.rows[0].count === '3' && unis.rows[0].count === '264' && progs.rows[0].count === '5382') {
      console.log('✨ ✅ SUCCESS! Database seeded correctly.\n');
    } else {
      console.log('⚠️  Counts don\'t match. Checking details...\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
