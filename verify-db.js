import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function verifyDatabase() {
  console.log('\n📊 Database Verification\n');
  console.log('Running the commands you requested:\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Run the 3 verification queries you requested
    console.log('SELECT COUNT(*) FROM users;');
    const users = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Result: ${users.rows[0].count} (Should return 3)\n`);
    
    console.log('SELECT COUNT(*) FROM universities;');
    const universities = await client.query('SELECT COUNT(*) FROM universities');
    console.log(`Result: ${universities.rows[0].count} (Should return 264)\n`);
    
    console.log('SELECT COUNT(*) FROM programs;');
    const programs = await client.query('SELECT COUNT(*) FROM programs');
    console.log(`Result: ${programs.rows[0].count} (Should return 5,382)\n`);
    
    // Summary
    const userCount = parseInt(users.rows[0].count);
    const uniCount = parseInt(universities.rows[0].count);
    const progCount = parseInt(programs.rows[0].count);
    
    console.log('═'.repeat(60));
    console.log('VERIFICATION RESULTS:');
    console.log('═'.repeat(60));
    console.log(`Users:        ${userCount === 3 ? '✅' : '❌'} ${userCount} / 3`);
    console.log(`Universities: ${uniCount === 264 ? '✅' : '❌'} ${uniCount} / 264`);
    console.log(`Programs:     ${progCount === 5382 ? '✅' : '❌'} ${progCount} / 5,382`);
    console.log('═'.repeat(60));
    
    if (userCount === 3 && uniCount === 264 && progCount === 5382) {
      console.log('\n✨ ✅ ALL CHECKS PASSED! Database is correctly seeded.\n');
    } else {
      console.log('\n⚠️  Database needs seeding. Run the seed script.\n');
    }
    
  } finally {
    await client.end();
  }
}

verifyDatabase().catch(console.error);
