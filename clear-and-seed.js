/**
 * Clear existing data and reseed database
 */

import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';

async function clearAndSeed() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       CLEAR & RESEED DATABASE                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Step 1: Clear existing data
    console.log('🗑️  Clearing existing data...\n');
    
    await sql`TRUNCATE TABLE closing_merits CASCADE`;
    console.log('✓ Cleared closing_merits');
    
    await sql`TRUNCATE TABLE merit_formulas CASCADE`;
    console.log('✓ Cleared merit_formulas');
    
    await sql`TRUNCATE TABLE programs CASCADE`;
    console.log('✓ Cleared programs');
    
    await sql`TRUNCATE TABLE campuses CASCADE`;
    console.log('✓ Cleared campuses');
    
    await sql`TRUNCATE TABLE universities CASCADE`;
    console.log('✓ Cleared universities');
    
    await sql`TRUNCATE TABLE users CASCADE`;
    console.log('✓ Cleared users\n');
    
    // Step 2: Read and execute seed SQL
    console.log('📄 Reading seed-data.sql...');
    const seedSQL = fs.readFileSync('./seed-data.sql', 'utf8');
    console.log(`✓ Loaded SQL file (${(seedSQL.length / 1024).toFixed(1)} KB)\n`);
    
    console.log('🗄️  Inserting fresh data...');
    console.log('   This may take 30-60 seconds...\n');
    
    await sql.query(seedSQL);
    
    console.log('✅ Database seeded successfully!\n');
    
    // Step 3: Verify data
    console.log('🔍 Verifying data...\n');
    
    const universities = await sql`SELECT COUNT(*) as count FROM universities`;
    console.log(`✓ Universities: ${universities.rows[0].count}`);
    
    const programs = await sql`SELECT COUNT(*) as count FROM programs`;
    console.log(`✓ Programs: ${programs.rows[0].count}`);
    
    const formulas = await sql`SELECT COUNT(*) as count FROM merit_formulas`;
    console.log(`✓ Merit Formulas: ${formulas.rows[0].count}`);
    
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✓ Users: ${users.rows[0].count}`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('SUCCESS! Database is ready');
    console.log('═'.repeat(70));
    console.log('\n🚀 Next step: npm run dev\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

clearAndSeed();
