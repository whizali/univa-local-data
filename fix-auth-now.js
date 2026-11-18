import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixAuth() {
  console.log('\n🔧 FIXING AUTHENTICATION\n');
  
  try {
    // Generate correct hash for "password123"
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log(`✓ Generated hash for: "${password}"`);
    console.log(`  Hash: ${hash}\n`);
    
    // Update all users
    const result = await sql`
      UPDATE users 
      SET password_hash = ${hash}
      WHERE username IN ('user1', 'user2', 'user3')
      RETURNING username
    `;
    
    console.log(`✓ Updated ${result.rowCount} users\n`);
    
    // Verify it works
    console.log('🔍 Verifying user1...');
    const user = await sql`
      SELECT username, password_hash
      FROM users
      WHERE username = 'user1'
    `;
    
    if (user.rows.length > 0) {
      const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
      console.log(`   Password "${password}" matches: ${isMatch ? '✅ YES' : '❌ NO'}\n`);
    }
    
    console.log('═══════════════════════════════════════════');
    console.log('✅ AUTHENTICATION FIXED!');
    console.log('═══════════════════════════════════════════');
    console.log('\nDefault credentials:');
    console.log('  Username: user1, user2, or user3');
    console.log(`  Password: ${password}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

fixAuth();
