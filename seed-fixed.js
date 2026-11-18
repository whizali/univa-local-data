import pg from 'pg';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function seedDatabase() {
  console.log('\n🌱 Seeding Production Database...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✓ Connected to database\n');
    
    const seedSQL = await readFile('./seed-data.sql', 'utf8');
    
    // Remove comments and split by semicolons, but be careful with JSON
    let inJsonBlock = false;
    let currentStatement = '';
    const statements = [];
    
    for (let i = 0; i < seedSQL.length; i++) {
      const char = seedSQL[i];
      const nextChar = seedSQL[i + 1];
      
      // Track if we're inside a JSON block (inside single quotes)
      if (char === "'" && seedSQL[i - 1] !== '\\') {
        inJsonBlock = !inJsonBlock;
      }
      
      currentStatement += char;
      
      // Only split on semicolon if not in JSON block
      if (char === ';' && !inJsonBlock) {
        const stmt = currentStatement.trim();
        if (stmt && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    console.log(`Found ${statements.length} statements\n`);
    
    // Execute statements
    let executed = 0;
    for (const stmt of statements) {
      if (stmt.length < 10) continue;
      
      try {
        executed++;
        const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
        console.log(`[${executed}] ${preview}...`);
        
        await client.query(stmt);
      } catch (error) {
        if (!error.message.includes('duplicate') && !error.message.includes('already exists')) {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Executed ${executed} statements\n`);
    
    // Verify
    console.log('📊 Verifying data...\n');
    
    const users = await client.query('SELECT COUNT(*) FROM users');
    const unis = await client.query('SELECT COUNT(*) FROM universities');
    const progs = await client.query('SELECT COUNT(*) FROM programs');
    
    console.log(`✓ Users: ${users.rows[0].count} (target: 3)`);
    console.log(`✓ Universities: ${unis.rows[0].count} (target: 264)`);
    console.log(`✓ Programs: ${progs.rows[0].count} (target: 5,382)`);
    
    const userCount = parseInt(users.rows[0].count);
    const uniCount = parseInt(unis.rows[0].count);
    const progCount = parseInt(progs.rows[0].count);
    
    if (userCount === 3 && uniCount === 264 && progCount === 5382) {
      console.log('\n✨ ✅ All verification checks passed! Database is ready.\n');
    } else {
      console.log('\n⚠️  Some counts don\'t match targets. Check for errors above.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
