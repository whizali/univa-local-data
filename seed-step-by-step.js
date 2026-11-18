import pg from 'pg';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function seedStepByStep() {
  console.log('\n🌱 Seeding Database (Step by Step)...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✓ Connected\n');
    
    const seedSQL = await readFile('./seed-data.sql', 'utf8');
    
    // Split by major INSERT statements
    const sections = [
      { name: 'Users', pattern: /INSERT INTO users[\s\S]*?ON CONFLICT.*?;/ },
      { name: 'Universities', pattern: /INSERT INTO universities[\s\S]*?ON CONFLICT.*?;/ },
      { name: 'Campuses', pattern: /INSERT INTO campuses[\s\S]*?ON CONFLICT.*?;/ },
      { name: 'Merit Formulas', pattern: /INSERT INTO merit_formulas[\s\S]*?ON CONFLICT.*?;/ },
      { name: 'Programs', pattern: /INSERT INTO programs[\s\S]*?ON CONFLICT.*?;/ }
    ];
    
    for (const section of sections) {
      try {
        const match = seedSQL.match(section.pattern);
        if (match) {
          console.log(`⏳ Inserting ${section.name}...`);
          await client.query(match[0]);
          console.log(`✅ ${section.name} inserted\n`);
        } else {
          console.log(`⚠️  No ${section.name} found in seed file\n`);
        }
      } catch (error) {
        console.error(`❌ Error inserting ${section.name}:`, error.message);
        console.error(`   Detail: ${error.detail || 'N/A'}\n`);
      }
    }
    
    // Verify
    console.log('📊 Final counts:\n');
    const users = await client.query('SELECT COUNT(*) FROM users');
    const unis = await client.query('SELECT COUNT(*) FROM universities');
    const progs = await client.query('SELECT COUNT(*) FROM programs');
    
    console.log(`   Users: ${users.rows[0].count}`);
    console.log(`   Universities: ${unis.rows[0].count}`);
    console.log(`   Programs: ${progs.rows[0].count}\n`);
    
    // Check targets
    const targets = { users: 3, universities: 264, programs: 5382 };
    const results = {
      users: parseInt(users.rows[0].count),
      universities: parseInt(unis.rows[0].count),
      programs: parseInt(progs.rows[0].count)
    };
    
    console.log('✨ Expected vs Actual:\n');
    Object.keys(targets).forEach(key => {
      const icon = results[key] === targets[key] ? '✅' : '⚠️';
      console.log(`   ${icon} ${key}: ${results[key]} / ${targets[key]}`);
    });
    console.log();
    
  } finally {
    await client.end();
  }
}

seedStepByStep().catch(console.error);
