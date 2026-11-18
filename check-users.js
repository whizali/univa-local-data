/**
 * Check if users exist in database
 */

import { sql } from '@vercel/postgres';

async function checkUsers() {
  console.log('🔍 Checking users table...\n');
  
  try {
    // Check if users table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;
    
    console.log(`Users table exists: ${tableCheck.rows[0].exists ? '✅ YES' : '❌ NO'}`);
    
    if (tableCheck.rows[0].exists) {
      // Get all users
      const users = await sql`SELECT id, username, name, email FROM users`;
      
      console.log(`\n📊 Found ${users.rowCount} users:\n`);
      
      if (users.rowCount === 0) {
        console.log('   ⚠️  No users found in database!');
        console.log('   ➡️  You need to run the seed-data.sql script in Vercel Postgres\n');
      } else {
        users.rows.forEach(user => {
          console.log(`   ${user.id}. ${user.username} (${user.name}) - ${user.email}`);
        });
        console.log('');
      }
    } else {
      console.log('\n❌ Users table does not exist!');
      console.log('   ➡️  You need to run create-tables.sql first\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('relation "users" does not exist')) {
      console.log('\n➡️  Run create-tables.sql in Vercel Postgres Query Editor first\n');
    }
    process.exit(1);
  }
}

checkUsers();
