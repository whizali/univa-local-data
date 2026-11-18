import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function checkSchema() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    
    // Check universities schema
    const universitiesSchema = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'universities'
      ORDER BY ordinal_position
    `);
    console.log('\nuniversities columns:');
    universitiesSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Check campuses schema
    const campusesSchema = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'campuses'
      ORDER BY ordinal_position
    `);
    console.log('\ncampuses columns:');
    campusesSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Check merit_formulas schema
    const formulasSchema = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'merit_formulas'
      ORDER BY ordinal_position
    `);
    console.log('\nmerit_formulas columns:');
    formulasSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Check programs schema
    const programsSchema = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'programs'
      ORDER BY ordinal_position
    `);
    console.log('\nprograms columns:');
    programsSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();
