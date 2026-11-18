/**
 * Quick seed with just 5 universities for testing
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function seedSample() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected\n');
    
    // Get admin user
    const user = await client.query('SELECT id FROM users LIMIT 1');
    const adminId = user.rows[0].id;
    
    await client.query('BEGIN');
    
    // Sample data
    const sampleData = [
      {
        id: 10,
        name: 'National University of Sciences and Technology',
        abbr: 'NUST',
        website: 'https://nust.edu.pk',
        type: 'Federal',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        formula: { matric: 10, inter: 15, test: 75 }
      },
      {
        id: 13,
        name: 'National University of Computer and Emerging Sciences',
        abbr: 'FAST',
        website: 'https://nu.edu.pk',
        type: 'Private',
        city: 'Karachi',
        province: 'Sindh',
        formula: { matric: 10, inter: 40, test: 50 }
      },
      {
        id: 4,
        name: 'University of the Punjab',
        abbr: 'PU',
        website: 'https://pu.edu.pk',
        type: 'Public',
        city: 'Lahore',
        province: 'Punjab',
        formula: { matric: 10, inter: 40, test: 50 }
      },
      {
        id: 7,
        name: 'COMSATS University Islamabad',
        abbr: 'CUI',
        website: 'https://comsats.edu.pk',
        type: 'Public',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        formula: { matric: 10, inter: 40, test: 50 }
      },
      {
        id: 1,
        name: 'Lahore University of Management Sciences',
        abbr: 'LUMS',
        website: 'https://lums.edu.pk',
        type: 'Private',
        city: 'Lahore',
        province: 'Punjab',
        formula: { matric: 0, inter: 0, test: 100 }
      }
    ];
    
    for (const uni of sampleData) {
      // Insert university
      await client.query(`
        INSERT INTO universities (id, name, abbreviation, website, type, city, province, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [uni.id, uni.name, uni.abbr, uni.website, uni.type, uni.city, uni.province, adminId]);
      
      // Insert sample program
      await client.query(`
        INSERT INTO programs (university_id, faculty, department, degree_levels, updated_by)
        VALUES ($1, $2, $3, $4, $5)
      `, [uni.id, 'Engineering & Technology', 'Computer Science', ['BS'], adminId]);
      
      // Insert merit formula
      await client.query(`
        INSERT INTO merit_formulas (
          university_id, program_type,
          matric_weight, intermediate_weight, entry_test_weight,
          additional_criteria, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (university_id, campus_id, program_type) DO NOTHING
      `, [
        uni.id,
        'general',
        uni.formula.matric / 100,
        uni.formula.inter / 100,
        uni.formula.test / 100,
        '{}',
        adminId
      ]);
      
      console.log(`✓ ${uni.abbr}`);
    }
    
    await client.query('COMMIT');
    
    // Show results
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM universities) as unis,
        (SELECT COUNT(*) FROM programs) as progs,
        (SELECT COUNT(*) FROM merit_formulas) as formulas
    `);
    
    console.log('\n✅ DATABASE SEEDED!\n');
    console.log(`Universities: ${counts.rows[0].unis}`);
    console.log(`Programs: ${counts.rows[0].progs}`);
    console.log(`Merit Formulas: ${counts.rows[0].formulas}\n`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

seedSample();
