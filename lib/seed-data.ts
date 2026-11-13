import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load existing data from your refined dataset
const loadExistingData = () => {
  const dataPath = path.join(process.cwd(), '..', 'data', 'refined');
  
  const universities = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'unified_university_profiles.json'), 'utf8')
  );
  
  const meritFormulas = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'merit_calculator_db.json'), 'utf8')
  );
  
  const programs = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'searchable_programs.json'), 'utf8')
  );
  
  return { universities, meritFormulas, programs };
};

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // 1. Create users (user1, user2, user3)
    console.log('👥 Creating users...');
    const users = [
      { username: 'user1', password: 'password123', name: 'Team Member 1', email: 'user1@merit.app' },
      { username: 'user2', password: 'password123', name: 'Team Member 2', email: 'user2@merit.app' },
      { username: 'user3', password: 'password123', name: 'Team Member 3', email: 'user3@merit.app' }
    ];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (username, password_hash, name, email)
        VALUES (${user.username}, ${hashedPassword}, ${user.name}, ${user.email})
        ON CONFLICT (username) DO NOTHING
      `;
    }
    console.log('✓ Users created\n');
    
    // 2. Load and import universities
    console.log('🏛️  Importing universities...');
    const { universities, meritFormulas, programs } = loadExistingData();
    
    let uniCount = 0;
    for (const [name, uni] of Object.entries(universities)) {
      await sql`
        INSERT INTO universities (
          id, name, abbreviation, website, type, city, province, updated_by
        ) VALUES (
          ${uni.id},
          ${uni.name},
          ${uni.abbreviation},
          ${uni.website || null},
          ${uni.type || null},
          ${uni.city || null},
          ${uni.province || null},
          1
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          abbreviation = EXCLUDED.abbreviation,
          website = EXCLUDED.website,
          updated_at = CURRENT_TIMESTAMP
      `;
      uniCount++;
    }
    console.log(`✓ Imported ${uniCount} universities\n`);
    
    // 3. Import merit formulas
    console.log('📐 Importing merit formulas...');
    let formulaCount = 0;
    for (const uni of meritFormulas.universities) {
      if (uni.formula && uni.formula.length > 0) {
        for (const formula of uni.formula) {
          await sql`
            INSERT INTO merit_formulas (
              university_id,
              formula_name,
              matric_weight,
              intermediate_weight,
              entry_test_weight,
              formula_details,
              updated_by
            ) VALUES (
              ${uni.id},
              ${formula.type || 'Default'},
              ${formula.matric || 0},
              ${formula.intermediate || 0},
              ${formula.entryTest || 0},
              ${JSON.stringify(formula)},
              1
            )
          `;
          formulaCount++;
        }
      }
    }
    console.log(`✓ Imported ${formulaCount} merit formulas\n`);
    
    // 4. Import programs
    console.log('📚 Importing programs...');
    let programCount = 0;
    for (const program of programs) {
      await sql`
        INSERT INTO programs (
          university_id,
          program_id,
          faculty,
          department,
          degree,
          full_program_name,
          campus_id,
          campus_name,
          updated_by
        ) VALUES (
          ${program.universityId},
          ${program.programId},
          ${program.faculty || null},
          ${program.department || null},
          ${program.degree || null},
          ${program.fullProgramName},
          ${program.campusId || null},
          ${program.campusName || null},
          1
        )
        ON CONFLICT (university_id, program_id) DO UPDATE SET
          full_program_name = EXCLUDED.full_program_name,
          updated_at = CURRENT_TIMESTAMP
      `;
      programCount++;
      
      if (programCount % 100 === 0) {
        console.log(`  Imported ${programCount} programs...`);
      }
    }
    console.log(`✓ Imported ${programCount} programs\n`);
    
    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: 3`);
    console.log(`   Universities: ${uniCount}`);
    console.log(`   Merit Formulas: ${formulaCount}`);
    console.log(`   Programs: ${programCount}`);
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   user1 / password123`);
    console.log(`   user2 / password123`);
    console.log(`   user3 / password123`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
