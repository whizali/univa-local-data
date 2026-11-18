import { sql } from '@vercel/postgres';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createTables() {
  console.log('\n🔧 Creating database tables...\n');
  
  try {
    const createSQL = await readFile('./create-tables.sql', 'utf8');
    
    // Split SQL into individual statements and execute
    const statements = createSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql.query(statement);
    }
    
    console.log('\n✅ All tables created successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

createTables();
