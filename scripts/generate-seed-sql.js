/**
 * Generate SQL INSERT statements from refined JSON data
 * Run this to create SQL file for easy data import
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data
const dataPath = path.join(__dirname, '..', '..', 'data', 'refined');

const universities = JSON.parse(
  fs.readFileSync(path.join(dataPath, 'unified_university_profiles.json'), 'utf8')
);

const meritFormulas = JSON.parse(
  fs.readFileSync(path.join(dataPath, 'merit_calculator_db.json'), 'utf8')
);

const programs = JSON.parse(
  fs.readFileSync(path.join(dataPath, 'searchable_programs.json'), 'utf8')
);

let sql = `-- Merit Data Collection - Seed Data
-- Generated: ${new Date().toISOString()}
-- Run this in Vercel Postgres Query editor

-- Insert users
INSERT INTO users (username, password_hash, name, email) VALUES
  ('user1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Team Member 1', 'user1@merit.app'),
  ('user2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Team Member 2', 'user2@merit.app'),
  ('user3', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Team Member 3', 'user3@merit.app')
ON CONFLICT (username) DO NOTHING;

-- Insert universities
`;

let uniCount = 0;
const uniValues = [];

for (const [name, uni] of Object.entries(universities)) {
  if (uniCount >= 266) break;
  
  const escapedName = uni.name.replace(/'/g, "''");
  const escapedAbbr = uni.abbreviation.replace(/'/g, "''");
  const escapedWebsite = (uni.website || '').replace(/'/g, "''");
  const escapedType = (uni.type || '').replace(/'/g, "''");
  const escapedCity = (uni.city || '').replace(/'/g, "''");
  const escapedProvince = (uni.province || '').replace(/'/g, "''");
  
  uniValues.push(
    `(${uni.id}, '${escapedName}', '${escapedAbbr}', ${uni.website ? `'${escapedWebsite}'` : 'NULL'}, ${uni.type ? `'${escapedType}'` : 'NULL'}, ${uni.city ? `'${escapedCity}'` : 'NULL'}, ${uni.province ? `'${escapedProvince}'` : 'NULL'}, 1)`
  );
  
  uniCount++;
}

sql += `INSERT INTO universities (id, name, abbreviation, website, type, city, province, updated_by) VALUES\n`;
sql += uniValues.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  abbreviation = EXCLUDED.abbreviation,
  website = EXCLUDED.website,
  type = EXCLUDED.type,
  city = EXCLUDED.city,
  province = EXCLUDED.province;\n\n`;

// Insert merit formulas
sql += `-- Insert merit formulas\n`;
const formulaValues = [];

// merit_calculator_db.json structure: { "University Name": [ {...formula objects...} ] }
for (const [uniName, formulasArray] of Object.entries(meritFormulas)) {
  // Find matching university by name
  const matchingUni = Object.values(universities).find(u => u.name === uniName);
  
  if (matchingUni && formulasArray && formulasArray.length > 0) {
    for (const formulaObj of formulasArray) {
      const formula = formulaObj.formula;
      const escapedName = (formulaObj.programGroup || 'Default').replace(/'/g, "''");
      const escapedDetails = JSON.stringify(formulaObj).replace(/'/g, "''");
      
      formulaValues.push(
        `(${matchingUni.id}, '${escapedName}', ${formula.matric || 0}, ${formula.intermediate || 0}, ${formula.entryTest || 0}, '${escapedDetails}', 1)`
      );
    }
  }
}

if (formulaValues.length > 0) {
  sql += `INSERT INTO merit_formulas (university_id, formula_name, matric_weight, intermediate_weight, entry_test_weight, formula_details, updated_by) VALUES\n`;
  sql += formulaValues.join(',\n');
  sql += `;\n\n`;
}

// Insert programs (in batches of 500)
sql += `-- Insert programs (${programs.length} total)\n`;

const batchSize = 500;
for (let i = 0; i < programs.length; i += batchSize) {
  const batch = programs.slice(i, i + batchSize);
  const programValues = [];
  
  for (const program of batch) {
    const escapedFaculty = (program.faculty || '').replace(/'/g, "''");
    const escapedDepartment = (program.department || '').replace(/'/g, "''");
    const escapedDegree = (program.degree || '').replace(/'/g, "''");
    const escapedProgramName = program.fullProgramName.replace(/'/g, "''");
    const escapedCampusName = (program.campusName || '').replace(/'/g, "''");
    
    programValues.push(
      `(${program.universityId}, ${program.programId}, ${program.faculty ? `'${escapedFaculty}'` : 'NULL'}, ${program.department ? `'${escapedDepartment}'` : 'NULL'}, ${program.degree ? `'${escapedDegree}'` : 'NULL'}, '${escapedProgramName}', ${program.campusId || 'NULL'}, ${program.campusName ? `'${escapedCampusName}'` : 'NULL'}, 1)`
    );
  }
  
  sql += `-- Batch ${Math.floor(i / batchSize) + 1}\n`;
  sql += `INSERT INTO programs (university_id, program_id, faculty, department, degree, full_program_name, campus_id, campus_name, updated_by) VALUES\n`;
  sql += programValues.join(',\n');
  sql += `\nON CONFLICT (university_id, program_id) DO UPDATE SET
  full_program_name = EXCLUDED.full_program_name,
  faculty = EXCLUDED.faculty,
  department = EXCLUDED.department,
  degree = EXCLUDED.degree,
  campus_name = EXCLUDED.campus_name;\n\n`;
}

// Summary
sql += `-- Seeding complete!
-- Summary:
--   Users: 3
--   Universities: ${uniCount}
--   Merit Formulas: ${formulaValues.length}
--   Programs: ${programs.length}
--
-- Login with:
--   user1 / password123
--   user2 / password123
--   user3 / password123
`;

// Write SQL file
const outputPath = path.join(__dirname, '..', 'seed-data.sql');
fs.writeFileSync(outputPath, sql);

console.log(`\n✅ SQL seed file generated!`);
console.log(`📁 Location: ${outputPath}`);
console.log(`📊 Summary:`);
console.log(`   - Users: 3`);
console.log(`   - Universities: ${uniCount}`);
console.log(`   - Merit Formulas: ${formulaValues.length}`);
console.log(`   - Programs: ${programs.length}`);
console.log(`\n🚀 Next steps:`);
console.log(`   1. Open Vercel Postgres Query editor`);
console.log(`   2. Copy the content of seed-data.sql`);
console.log(`   3. Paste and run in Query editor`);
console.log(`   4. Verify data imported successfully\n`);
