import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixPasswords() {
  console.log('\n🔧 Fixing User Passwords\n');
  
  try {
    // Generate hash for "password"
    const passwordHash = await bcrypt.hash('password', 10);
    console.log('Generated hash for password: "password"');
    console.log(`Hash: ${passwordHash}\n`);
    
    // Get all users
    const users = await sql`SELECT id, username FROM users`;
    console.log(`Found ${users.rows.length} users to update\n`);
    
    // Update each user
    for (const user of users.rows) {
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}
        WHERE id = ${user.id}
      `;
      console.log(`✓ Updated password for: ${user.username}`);
    }
    
    console.log('\n✅ All passwords updated successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    users.rows.forEach(u => {
      console.log(`   Username: ${u.username}`);
      console.log(`   Password: password`);
      console.log('');
    });
    
    console.log('🎉 You can now login with these credentials!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

fixPasswords();
