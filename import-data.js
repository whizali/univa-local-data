/**
 * Import data from main dataset to app database
 */

import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';

async function importData() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       IMPORTING DATA FROM MAIN DATASET                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Load unified profiles
    console.log('📄 Loading unified university profiles...');
    const profilesData = fs.readFileSync('../data/refined/unified_university_profiles.json', 'utf8');
    const profiles = JSON.parse(profilesData);
    console.log(`✓ Loaded ${Object.keys(profiles).length} universities\n`);
    
    // Load merit formulas
    console.log('📄 Loading merit formulas...');
    const formulasData = fs.readFileSync('../data/refined/merit_calculator_db.json', 'utf8');
    const formulas = JSON.parse(formulasData);
    console.log(`✓ Loaded ${formulas.universities.length} universities with formulas\n`);
    
    console.log('🗄️ Importing universities...');
    let uniCount = 0;
    
    for (const [name, profile] of Object.entries(profiles)) {
      await sql`
        INSERT INTO universities (id, name, abbreviation, website, type, city, province, updated_by)
        VALUES (
          ${profile.id},
          ${profile.name},
          ${profile.abbreviation || null},
          ${profile.website || null},
          ${profile.type || 'Unknown'},
          ${profile.city || null},
          ${profile.province || null},
          1
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          abbreviation = EXCLUDED.abbreviation,
          website = EXCLUDED.website,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      uniCount++;
      if (uniCount % 50 === 0) {
        console.log(`   Imported ${uniCount} universities...`);
      }
    }
    
    console.log(`✓ Imported ${uniCount} universities\n`);
    
    // Import campuses
    console.log('🏫 Importing campuses...');
    let campusCount = 0;
    
    for (const [name, profile] of Object.entries(profiles)) {
      if (profile.campuses && profile.campuses.length > 0) {
        for (const campus of profile.campuses) {
          await sql`
            INSERT INTO campuses (id, university_id, name, city, code, updated_by)
            VALUES (
              ${campus.id},
              ${profile.id},
              ${campus.name},
              ${campus.city || null},
              ${campus.code || null},
              1
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              city = EXCLUDED.city
          `;
          campusCount++;
        }
      }
    }
    
    console.log(`✓ Imported ${campusCount} campuses\n`);
    
    // Import programs
    console.log('📚 Importing programs...');
    let progCount = 0;
    
    for (const [name, profile] of Object.entries(profiles)) {
      if (profile.programs && profile.programs.length > 0) {
        for (const program of profile.programs) {
          await sql`
            INSERT INTO programs (id, university_id, campus_id, faculty, department, degree_levels, updated_by)
            VALUES (
              ${program.id},
              ${profile.id},
              ${program.campusId || null},
              ${program.faculty || null},
              ${program.department},
              ${program.degreeLevels || []},
              1
            )
            ON CONFLICT (id) DO UPDATE SET
              faculty = EXCLUDED.faculty,
              department = EXCLUDED.department,
              degree_levels = EXCLUDED.degree_levels
          `;
          progCount++;
          
          if (progCount % 100 === 0) {
            console.log(`   Imported ${progCount} programs...`);
          }
        }
      }
    }
    
    console.log(`✓ Imported ${progCount} programs\n`);
    
    // Import merit formulas
    console.log('🧮 Importing merit formulas...');
    let formulaCount = 0;
    
    for (const uni of formulas.universities) {
      if (uni.formulas && uni.formulas.length > 0) {
        for (const formula of uni.formulas) {
          await sql`
            INSERT INTO merit_formulas (
              university_id,
              program_type,
              matric_weight,
              intermediate_weight,
              entry_test_weight,
              additional_criteria,
              updated_by
            )
            VALUES (
              ${uni.id},
              ${formula.programType || 'General'},
              ${formula.matric || 0},
              ${formula.intermediate || 0},
              ${formula.entryTest || 0},
              ${JSON.stringify(formula.additionalCriteria || {})},
              1
            )
          `;
          formulaCount++;
        }
      }
    }
    
    console.log(`✓ Imported ${formulaCount} merit formulas\n`);
    
    // Verify
    console.log('🔍 Verifying import...\n');
    
    const uniVerify = await sql`SELECT COUNT(*) as count FROM universities`;
    console.log(`✓ Universities: ${uniVerify.rows[0].count}`);
    
    const campusVerify = await sql`SELECT COUNT(*) as count FROM campuses`;
    console.log(`✓ Campuses: ${campusVerify.rows[0].count}`);
    
    const progVerify = await sql`SELECT COUNT(*) as count FROM programs`;
    console.log(`✓ Programs: ${progVerify.rows[0].count}`);
    
    const formulaVerify = await sql`SELECT COUNT(*) as count FROM merit_formulas`;
    console.log(`✓ Merit Formulas: ${formulaVerify.rows[0].count}`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('SUCCESS! Data import complete');
    console.log('═'.repeat(70));
    console.log('\n🚀 App database is fully populated and ready!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importData();
