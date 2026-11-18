/**
 * Rebuild the app schema and load universities, campuses, programs and merit
 * formulas from data/refined.
 *
 * Usage: npm run db:setup
 * Requires a users row to exist (it is created if missing).
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const APP_DIR = process.cwd();
const REFINED_DIR = path.join(APP_DIR, '..', 'data', 'refined');

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No database connection string found (POSTGRES_URL / DATABASE_URL).');
  process.exit(1);
}

const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(REFINED_DIR, name), 'utf8'));

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

function placeholders(rows, columns) {
  return rows
    .map(
      (_, rowIndex) =>
        '(' +
        columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ') +
        ')'
    )
    .join(', ');
}

async function insertRows(client, table, columns, rows) {
  for (const batch of chunk(rows, 400)) {
    const values = batch.flat();
    await client.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders(batch, columns)}`,
      values
    );
  }
}

async function main() {
  const profiles = readJson('unified_university_profiles.json');
  const searchablePrograms = readJson('searchable_programs.json');
  const formulasByName = readJson('merit_calculator_db.json');
  const schemaSql = fs.readFileSync(path.join(APP_DIR, 'lib', 'db-schema.sql'), 'utf8');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Dropping old collection tables (users are preserved)...');
    await client.query(`
      DROP TABLE IF EXISTS merit_lists, activity_log, closing_merits,
        merit_formulas, programs, campuses, universities CASCADE;
    `);

    console.log('Creating schema...');
    await client.query(schemaSql);

    console.log('Ensuring team users exist...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      ['user1', 'Team Member 1', 'user1@merit.app'],
      ['user2', 'Team Member 2', 'user2@merit.app'],
      ['user3', 'Team Member 3', 'user3@merit.app'],
    ];
    for (const [username, name, email] of users) {
      await client.query(
        `INSERT INTO users (username, password_hash, name, email)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [username, passwordHash, name, email]
      );
    }
    const { rows: userRows } = await client.query('SELECT id FROM users ORDER BY id LIMIT 1');
    if (!userRows.length) throw new Error('No user row available for updated_by');
    const userId = userRows[0].id;

    const universityRows = [];
    const campusRows = [];
    const universityIdByName = new Map();

    for (const profile of Object.values(profiles)) {
      if (!profile.id || !profile.name) continue;
      universityIdByName.set(profile.name, profile.id);
      universityRows.push([
        profile.id,
        profile.name,
        profile.abbreviation || null,
        profile.website || null,
        profile.type || null,
        profile.city || null,
        profile.province || null,
        userId,
      ]);
      for (const campus of profile.campuses || []) {
        campusRows.push([
          campus.id,
          profile.id,
          campus.name,
          campus.city || null,
          campus.code || null,
          userId,
        ]);
      }
    }

    await client.query('BEGIN');

    console.log(`Inserting ${universityRows.length} universities...`);
    await insertRows(
      client,
      'universities',
      ['id', 'name', 'abbreviation', 'website', 'type', 'city', 'province', 'updated_by'],
      universityRows
    );

    console.log(`Inserting ${campusRows.length} campuses...`);
    await insertRows(
      client,
      'campuses',
      ['id', 'university_id', 'name', 'city', 'code', 'updated_by'],
      campusRows
    );

    console.log(`Inserting ${searchablePrograms.length} programs...`);
    await insertRows(
      client,
      'programs',
      [
        'university_id',
        'program_id',
        'faculty',
        'department',
        'degree',
        'full_program_name',
        'campus_id',
        'campus_name',
        'updated_by',
      ],
      searchablePrograms.map((program) => [
        program.universityId,
        program.programId,
        program.faculty || null,
        program.department || null,
        program.degree || null,
        program.fullProgramName,
        program.campusId || null,
        program.campusName || null,
        userId,
      ])
    );

    const formulaRows = [];
    for (const [universityName, formulas] of Object.entries(formulasByName)) {
      const universityId = universityIdByName.get(universityName);
      if (!universityId) continue;
      for (const formula of formulas) {
        formulaRows.push([
          universityId,
          formula.programGroup || 'Default',
          formula.formula?.matric ?? null,
          formula.formula?.intermediate ?? null,
          formula.formula?.entryTest ?? null,
          JSON.stringify(formula),
          userId,
        ]);
      }
    }

    console.log(`Inserting ${formulaRows.length} merit formulas...`);
    await insertRows(
      client,
      'merit_formulas',
      [
        'university_id',
        'formula_name',
        'matric_weight',
        'intermediate_weight',
        'entry_test_weight',
        'formula_details',
        'updated_by',
      ],
      formulaRows
    );

    await client.query('COMMIT');

    const { rows: counts } = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM universities) AS universities,
        (SELECT COUNT(*) FROM campuses) AS campuses,
        (SELECT COUNT(*) FROM programs) AS programs,
        (SELECT COUNT(*) FROM merit_formulas) AS formulas,
        (SELECT COUNT(*) FROM closing_merits) AS merits
    `);
    console.log('\nDatabase ready:', counts[0]);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
