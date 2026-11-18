/**
 * Update user passwords in database
 * Run this after fixing the password hash
 */

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

async function updatePasswords() {
  console.log('🔐 Updating user passwords...\n');
  
  try {
    // Generate hash for password123
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log(`Generated hash for password: ${password}`);
    console.log(`Hash: ${hash}\n`);
    
    // Update all users
    const result = await sql`
      UPDATE users 
      SET password_hash = ${hash}
      WHERE username IN ('user1', 'user2', 'user3')
      RETURNING username
    `;
    
    console.log(`✅ Updated ${result.rowCount} users:`);
    result.rows.forEach(row => console.log(`   - ${row.username}`));
    
    console.log(`\n🎉 All users can now login with password: ${password}\n`);
    
    // Verify by trying to login as user1
    console.log('🔍 Verifying user1...');
    const user = await sql`
      SELECT username, password_hash
      FROM users
      WHERE username = 'user1'
    `;
    
    if (user.rows.length > 0) {
      const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
      console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
