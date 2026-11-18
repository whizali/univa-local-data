/**
 * Verify database setup for deployment
 */

import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function verifyDeployment() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       DEPLOYMENT VERIFICATION                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Check tables
    console.log('📊 Checking tables...\n');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('✓ Tables found:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    const expectedTables = ['users', 'universities', 'campuses', 'programs', 'merit_formulas', 'closing_merits'];
    const foundTables = tables.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log(`   Run: npm run setup-db\n`);
    } else {
      console.log('\n✅ All required tables exist');
    }
    
    // Check data
    console.log('\n📈 Checking data...\n');
    
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✓ Users: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count === '0') {
      console.log(`   ⚠️  No users found. Run: node test-seed.js`);
    }
    
    const uniCount = await sql`SELECT COUNT(*) as count FROM universities`;
    console.log(`✓ Universities: ${uniCount.rows[0].count}`);
    
    const progCount = await sql`SELECT COUNT(*) as count FROM programs`;
    console.log(`✓ Programs: ${progCount.rows[0].count}`);
    
    const formulaCount = await sql`SELECT COUNT(*) as count FROM merit_formulas`;
    console.log(`✓ Merit Formulas: ${formulaCount.rows[0].count}`);
    
    // Test database connection
    console.log('\n🔌 Testing connection...\n');
    const testQuery = await sql`SELECT NOW() as current_time`;
    console.log(`✓ Connected to database`);
    console.log(`   Server time: ${testQuery.rows[0].current_time}`);
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('VERIFICATION SUMMARY');
    console.log('═'.repeat(70));
    
    const allGood = missingTables.length === 0 && userCount.rows[0].count > 0;
    
    if (allGood) {
      console.log('\n✅ Database is ready for deployment!');
      console.log('\n🚀 Deploy with: vercel --prod');
    } else {
      console.log('\n⚠️  Database setup incomplete:');
      if (missingTables.length > 0) {
        console.log(`   1. Run: npm run setup-db`);
      }
      if (userCount.rows[0].count === '0') {
        console.log(`   2. Run: node test-seed.js`);
      }
    }
    
    console.log('\n');
    
    process.exit(allGood ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyDeployment();
