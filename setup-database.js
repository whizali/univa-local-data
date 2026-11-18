/**
 * Database Setup Script
 * Runs seed-data.sql to initialize the database
 */

import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       DATABASE SETUP - NEON POSTGRESQL                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Read seed SQL file
    const sqlFile = path.join(__dirname, 'seed-data.sql');
    console.log('📄 Reading seed-data.sql...');
    const seedSQL = fs.readFileSync(sqlFile, 'utf8');
    console.log(`✓ Loaded SQL file (${(seedSQL.length / 1024).toFixed(1)} KB)\n`);
    
    // Execute SQL
    console.log('🗄️ Creating tables and inserting data...');
    console.log('   This may take 30-60 seconds...\n');
    
    await sql.query(seedSQL);
    
    console.log('✅ Database setup complete!\n');
    
    // Verify data
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
    console.error('\n❌ Error setting up database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
