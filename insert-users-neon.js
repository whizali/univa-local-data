import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function insertUsers() {
  try {
    console.log('🔌 Connecting to Neon database...');
    console.log(`   Host: ${process.env.POSTGRES_HOST}`);
    
    // Insert users
    const result = await sql`
      INSERT INTO users (username, password_hash, name, email) VALUES
        ('user1', '$2b$10$/gwFwgBzaWe.LAOyxQgwoObJ/OYUpR6lSTY8LOooNK7qRba4pXHGS', 'Team Member 1', 'user1@merit.app'),
        ('user2', '$2b$10$/gwFwgBzaWe.LAOyxQgwoObJ/OYUpR6lSTY8LOooNK7qRba4pXHGS', 'Team Member 2', 'user2@merit.app'),
        ('user3', '$2b$10$/gwFwgBzaWe.LAOyxQgwoObJ/OYUpR6lSTY8LOooNK7qRba4pXHGS', 'Team Member 3', 'user3@merit.app')
      ON CONFLICT (username) DO NOTHING
    `;
    
    console.log('✅ Users inserted successfully!');
    console.log(`   Rows affected: ${result.rowCount}`);
    
    // Verify users exist
    const verify = await sql`SELECT username, name, email FROM users ORDER BY id`;
    
    console.log('\n👥 Current users in database:');
    console.log('─'.repeat(70));
    verify.rows.forEach(user => {
      console.log(`   • ${user.username.padEnd(15)} | ${user.name.padEnd(20)} | ${user.email}`);
    });
    console.log('─'.repeat(70));
    
    console.log('\n🔑 Login credentials:');
    console.log('   Username: user1, user2, or user3');
    console.log('   Password: password123');
    console.log('\n✨ Ready to use!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error inserting users:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

insertUsers();
