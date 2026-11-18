import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testAuth() {
  console.log('\n🔐 Testing Authentication\n');
  
  try {
    // Test 1: Check if users table exists and has data
    console.log('1. Checking users in database...');
    const users = await sql`SELECT username, password_hash, name FROM users`;
    
    if (users.rows.length === 0) {
      console.log('❌ No users found in database!');
      console.log('   Run: npm run seed-data');
      return;
    }
    
    console.log(`✓ Found ${users.rows.length} users:`);
    users.rows.forEach(u => console.log(`   - ${u.username} (${u.name})`));
    
    // Test 2: Verify the password hash
    console.log('\n2. Testing password hash...');
    const testUser = users.rows[0];
    const testPassword = 'password';
    
    console.log(`   Testing user: ${testUser.username}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Hash: ${testUser.password_hash}`);
    
    const isMatch = await bcrypt.compare(testPassword, testUser.password_hash);
    
    if (isMatch) {
      console.log('   ✅ Password matches!');
    } else {
      console.log('   ❌ Password does NOT match!');
      console.log('   The hash in database might be incorrect.');
      
      // Generate correct hash
      console.log('\n3. Generating correct hash...');
      const correctHash = await bcrypt.hash(testPassword, 10);
      console.log(`   New hash: ${correctHash}`);
      console.log('\n   To fix, run this SQL:');
      console.log(`   UPDATE users SET password_hash = '${correctHash}' WHERE username = '${testUser.username}';`);
    }
    
    // Test 3: Test all default passwords
    console.log('\n4. Testing all default user passwords...');
    for (const user of users.rows) {
      const match = await bcrypt.compare('password', user.password_hash);
      if (match) {
        console.log(`   ✅ ${user.username}: password works`);
      } else {
        console.log(`   ❌ ${user.username}: password does NOT work`);
      }
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('   Default credentials:');
    console.log('   Username: user1, user2, or user3');
    console.log('   Password: password');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

testAuth();
