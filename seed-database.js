import pkg from 'pg';
const { Client } = pkg;
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       SEEDING PRODUCTION DATABASE                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Database:', process.env.POSTGRES_HOST);
  console.log('📝 Database Name:', process.env.POSTGRES_DATABASE);
  console.log('👤 User:', process.env.POSTGRES_USER);
  console.log('\n');
  
  try {
    // Connect to database
    await client.connect();
    
    // Test connection first
    console.log('🔌 Testing database connection...');
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ Connected! Server time:', testResult.rows[0].current_time);
    console.log('');
    
    // Read seed data
    console.log('📖 Reading seed-data.sql...');
    const seedSQL = await readFile('./seed-data.sql', 'utf8');
    const fileSizeMB = (seedSQL.length / 1024 / 1024).toFixed(2);
    console.log(`✅ Loaded ${fileSizeMB} MB of SQL data`);
    console.log('');
    
    // Execute the entire SQL file at once
    console.log('⏳ Executing SQL (this may take 1-2 minutes)...\n');
    console.log('═'.repeat(70));
    
    try {
      // Use pg client's query to execute entire SQL
      await client.query(seedSQL);
      
      console.log('✅ SQL executed successfully!');
      console.log('═'.repeat(70));
      console.log('');
      
    } catch (error) {
      console.log('❌ ERROR during execution');
      console.error(`   Error: ${error.message}`);
      // Try to show which line failed
      if (error.position) {
        const position = parseInt(error.position);
        const context = seedSQL.substring(Math.max(0, position - 100), position + 100);
        console.error(`   Context: ...${context}...`);
      }
      console.log('═'.repeat(70));
      console.log('');
    }
    
    // Verification queries
    console.log('🔍 Verifying data insertion...\n');
    
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Users: ${userCount.rows[0].count}`);
    
    const uniCount = await client.query('SELECT COUNT(*) as count FROM universities');
    console.log(`✓ Universities: ${uniCount.rows[0].count}`);
    
    const formulaCount = await client.query('SELECT COUNT(*) as count FROM merit_formulas');
    console.log(`✓ Merit Formulas: ${formulaCount.rows[0].count}`);
    
    const programCount = await client.query('SELECT COUNT(*) as count FROM programs');
    console.log(`✓ Programs: ${programCount.rows[0].count}`);
    
    console.log('');
    console.log('═'.repeat(70));
    console.log('SEEDING SUMMARY');
    console.log('═'.repeat(70));
    
    const totalRecords = parseInt(userCount.rows[0].count) + parseInt(uniCount.rows[0].count) + 
                        parseInt(formulaCount.rows[0].count) + parseInt(programCount.rows[0].count);
    
    if (totalRecords > 6000) {
      console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
      console.log('\n✨ Your production database is ready with:');
      console.log(`   • ${userCount.rows[0].count} users`);
      console.log(`   • ${uniCount.rows[0].count} universities`);
      console.log(`   • ${formulaCount.rows[0].count} merit formulas`);
      console.log(`   • ${programCount.rows[0].count} programs`);
      console.log(`   • ${totalRecords} total records`);
      console.log('\n🚀 Ready to deploy API!\n');
    } else {
      console.log('\n⚠️  Data verification shows incomplete seeding.\n');
      console.log(`Expected ~6,694 records, found ${totalRecords}\n`);
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

seedDatabase();
