/**
 * Seed database from the refined JSON data files
 */

import pg from 'pg';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function seedDatabase() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database\n');
    
    // Check if admin user exists
    const usersResult = await client.query('SELECT id FROM users LIMIT 1');
    const adminUserId = usersResult.rows[0]?.id;
    
    if (!adminUserId) {
      console.log('❌ No users found. Please create an admin user first.');
      return;
    }
    
    console.log(`✓ Using admin user ID: ${adminUserId}\n`);
    
    // Load unified university profiles
    console.log('📁 Loading university profiles...');
    const profilesPath = '../data/refined/unified_university_profiles.json';
    const profilesData = await fs.readFile(profilesPath, 'utf8');
    const profiles = JSON.parse(profilesData);
    
    console.log(`✓ Loaded ${Object.keys(profiles).length} university profiles\n`);
    
    // Load merit calculator database
    console.log('📁 Loading merit formulas...');
    const formulasPath = '../data/refined/merit_calculator_db.json';
    const formulasData = await fs.readFile(formulasPath, 'utf8');
    const formulasObj = JSON.parse(formulasData);
    
    // Convert object to flat array
    const formulas = [];
    for (const [uniName, formulasList] of Object.entries(formulasObj)) {
      formulas.push(...formulasList);
    }
    
    console.log(`✓ Loaded ${formulas.length} merit formulas\n`);
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('🔄 Starting database seeding...\n');
    
    let universitiesInserted = 0;
    let campusesInserted = 0;
    let programsInserted = 0;
    let formulasInserted = 0;
    
    // Insert universities, campuses, programs, and formulas
    for (const [uniName, uniData] of Object.entries(profiles)) {
      try {
        // Insert university
        const uniResult = await client.query(`
          INSERT INTO universities (id, name, abbreviation, website, type, city, province, updated_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            abbreviation = EXCLUDED.abbreviation,
            website = EXCLUDED.website,
            type = EXCLUDED.type,
            city = EXCLUDED.city,
            province = EXCLUDED.province,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [
          uniData.id,
          uniData.name,
          uniData.abbreviation || null,
          uniData.website || null,
          uniData.type || null,
          uniData.city || null,
          uniData.province || null,
          adminUserId
        ]);
        
        universitiesInserted++;
        
        // Insert campuses
        if (uniData.campuses && uniData.campuses.length > 0) {
          for (const campus of uniData.campuses) {
            await client.query(`
              INSERT INTO campuses (id, university_id, name, city, code, updated_by)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                city = EXCLUDED.city,
                code = EXCLUDED.code
            `, [
              campus.id,
              uniData.id,
              campus.name,
              campus.city || null,
              campus.code || null,
              adminUserId
            ]);
            
            campusesInserted++;
          }
        }
        
        // Insert programs
        if (uniData.programs && uniData.programs.length > 0) {
          for (const program of uniData.programs) {
            await client.query(`
              INSERT INTO programs (id, university_id, campus_id, faculty, department, degree_levels, updated_by)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (id) DO UPDATE SET
                faculty = EXCLUDED.faculty,
                department = EXCLUDED.department,
                degree_levels = EXCLUDED.degree_levels
            `, [
              program.id,
              uniData.id,
              program.campusId || null,
              program.faculty || null,
              program.department,
              program.degreeLevels || [],
              adminUserId
            ]);
            
            programsInserted++;
          }
        }
        
        // Insert merit formulas (find by university name)
        const uniFormulas = formulas.filter(f => f.university === uniData.name);
        for (const formulaEntry of uniFormulas) {
          const formula = formulaEntry.formula;
          await client.query(`
            INSERT INTO merit_formulas (
              university_id, campus_id, program_type,
              matric_weight, intermediate_weight, entry_test_weight,
              additional_criteria, updated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (university_id, campus_id, program_type) DO UPDATE SET
              matric_weight = EXCLUDED.matric_weight,
              intermediate_weight = EXCLUDED.intermediate_weight,
              entry_test_weight = EXCLUDED.entry_test_weight,
              additional_criteria = EXCLUDED.additional_criteria
          `, [
            uniData.id,
            null, // campus_id
            formulaEntry.programGroup || 'general',
            formula.matric / 100, // Convert to decimal
            formula.intermediate / 100,
            formula.entryTest / 100,
            JSON.stringify({
              testInfo: formulaEntry.testInfo || {},
              interviewWeight: formula.interview || 0
            }),
            adminUserId
          ]);
          
          formulasInserted++;
        }
        
        if (universitiesInserted % 10 === 0) {
          console.log(`  Processed ${universitiesInserted} universities...`);
        }
        
      } catch (error) {
        console.error(`Error processing ${uniName}:`, error.message);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n' + '═'.repeat(70));
    console.log('DATABASE SEEDING COMPLETE');
    console.log('═'.repeat(70));
    console.log(`\n✅ Universities: ${universitiesInserted}`);
    console.log(`✅ Campuses: ${campusesInserted}`);
    console.log(`✅ Programs: ${programsInserted}`);
    console.log(`✅ Merit Formulas: ${formulasInserted}\n`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error seeding database:', error);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

seedDatabase();
