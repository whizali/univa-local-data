import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log('\n📋 Tables in database:');
    if (res.rows.length === 0) {
      console.log('   (none - need to run create-tables.sql first)\n');
    } else {
      res.rows.forEach(row => console.log(`   - ${row.tablename}`));
      console.log();
    }
    
    // Check counts if tables exist
    if (res.rows.length > 0) {
      try {
        const users = await client.query('SELECT COUNT(*) FROM users');
        const unis = await client.query('SELECT COUNT(*) FROM universities');
        const progs = await client.query('SELECT COUNT(*) FROM programs');
        
        console.log('📊 Current data:');
        console.log(`   Users: ${users.rows[0].count}`);
        console.log(`   Universities: ${unis.rows[0].count}`);
        console.log(`   Programs: ${progs.rows[0].count}\n`);
      } catch(e) {
        console.log('   (tables exist but empty)\n');
      }
    }
    
  } finally {
    await client.end();
  }
}

checkTables().catch(console.error);
