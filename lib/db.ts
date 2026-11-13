import { sql } from '@vercel/postgres';

export interface University {
  id: number;
  name: string;
  abbreviation: string;
  website?: string;
  type?: string;
  city?: string;
  province?: string;
  programCount?: number;
  meritEntriesCount?: number;
}

export interface Program {
  id: number;
  universityId: number;
  programId: number;
  faculty?: string;
  department?: string;
  degree?: string;
  fullProgramName: string;
  campusId?: number;
  campusName?: string;
  closingMeritsCount?: number;
}

export interface MeritFormula {
  id: number;
  universityId: number;
  formulaName?: string;
  matricWeight: number;
  intermediateWeight: number;
  entryTestWeight: number;
  formulaDetails?: any;
}

export interface ClosingMerit {
  id: number;
  universityId: number;
  programId: number;
  year: number;
  openingMerit?: number;
  finalClosingMerit: number;
  totalSeats?: number;
  totalApplicants?: number;
  genderCategory?: string;
  seatCategory?: string;
  sourceUrl?: string;
  notes?: string;
  verified: boolean;
  createdBy?: number;
  createdByName?: string;
  updatedAt?: Date;
}

// Universities
export async function getUniversities(search?: string) {
  if (search) {
    const result = await sql`
      SELECT u.*,
        COUNT(DISTINCT p.id) as program_count,
        COUNT(DISTINCT cm.id) as merit_entries_count
      FROM universities u
      LEFT JOIN programs p ON u.id = p.university_id
      LEFT JOIN closing_merits cm ON u.id = cm.university_id
      WHERE u.name ILIKE ${'%' + search + '%'}
        OR u.abbreviation ILIKE ${'%' + search + '%'}
      GROUP BY u.id
      ORDER BY u.name
    `;
    return result.rows as University[];
  }
  
  const result = await sql`
    SELECT u.*,
      COUNT(DISTINCT p.id) as program_count,
      COUNT(DISTINCT cm.id) as merit_entries_count
    FROM universities u
    LEFT JOIN programs p ON u.id = p.university_id
    LEFT JOIN closing_merits cm ON u.id = cm.university_id
    GROUP BY u.id
    ORDER BY u.name
    LIMIT 100
  `;
  return result.rows as University[];
}

export async function getUniversityById(id: number) {
  const result = await sql`
    SELECT u.*,
      COUNT(DISTINCT p.id) as program_count,
      COUNT(DISTINCT cm.id) as merit_entries_count
    FROM universities u
    LEFT JOIN programs p ON u.id = p.university_id
    LEFT JOIN closing_merits cm ON u.id = cm.university_id
    WHERE u.id = ${id}
    GROUP BY u.id
  `;
  return result.rows[0] as University;
}

export async function updateUniversity(id: number, data: Partial<University>, userId: number) {
  await sql`
    UPDATE universities
    SET
      name = COALESCE(${data.name}, name),
      abbreviation = COALESCE(${data.abbreviation}, abbreviation),
      website = COALESCE(${data.website}, website),
      type = COALESCE(${data.type}, type),
      city = COALESCE(${data.city}, city),
      province = COALESCE(${data.province}, province),
      updated_by = ${userId},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
  
  return getUniversityById(id);
}

// Programs
export async function getProgramsByUniversity(universityId: number) {
  const result = await sql`
    SELECT p.*,
      COUNT(cm.id) as closing_merits_count
    FROM programs p
    LEFT JOIN closing_merits cm ON p.id = cm.program_id
    WHERE p.university_id = ${universityId}
    GROUP BY p.id
    ORDER BY p.full_program_name
  `;
  return result.rows as Program[];
}

export async function addProgram(data: Omit<Program, 'id'>, userId: number) {
  const result = await sql`
    INSERT INTO programs (
      university_id, program_id, faculty, department, degree,
      full_program_name, campus_id, campus_name, updated_by
    ) VALUES (
      ${data.universityId}, ${data.programId}, ${data.faculty}, ${data.department},
      ${data.degree}, ${data.fullProgramName}, ${data.campusId}, ${data.campusName}, ${userId}
    )
    RETURNING *
  `;
  return result.rows[0] as Program;
}

export async function updateProgram(id: number, data: Partial<Program>, userId: number) {
  await sql`
    UPDATE programs
    SET
      faculty = COALESCE(${data.faculty}, faculty),
      department = COALESCE(${data.department}, department),
      degree = COALESCE(${data.degree}, degree),
      full_program_name = COALESCE(${data.fullProgramName}, full_program_name),
      campus_name = COALESCE(${data.campusName}, campus_name),
      updated_by = ${userId}
    WHERE id = ${id}
  `;
}

export async function deleteProgram(id: number) {
  await sql`DELETE FROM programs WHERE id = ${id}`;
}

// Merit Formulas
export async function getMeritFormulasByUniversity(universityId: number) {
  const result = await sql`
    SELECT * FROM merit_formulas
    WHERE university_id = ${universityId}
    ORDER BY id
  `;
  return result.rows as MeritFormula[];
}

export async function addMeritFormula(data: Omit<MeritFormula, 'id'>, userId: number) {
  const result = await sql`
    INSERT INTO merit_formulas (
      university_id, formula_name, matric_weight, intermediate_weight,
      entry_test_weight, formula_details, updated_by
    ) VALUES (
      ${data.universityId}, ${data.formulaName}, ${data.matricWeight},
      ${data.intermediateWeight}, ${data.entryTestWeight},
      ${JSON.stringify(data.formulaDetails)}, ${userId}
    )
    RETURNING *
  `;
  return result.rows[0] as MeritFormula;
}

export async function updateMeritFormula(id: number, data: Partial<MeritFormula>, userId: number) {
  await sql`
    UPDATE merit_formulas
    SET
      formula_name = COALESCE(${data.formulaName}, formula_name),
      matric_weight = COALESCE(${data.matricWeight}, matric_weight),
      intermediate_weight = COALESCE(${data.intermediateWeight}, intermediate_weight),
      entry_test_weight = COALESCE(${data.entryTestWeight}, entry_test_weight),
      formula_details = COALESCE(${JSON.stringify(data.formulaDetails)}, formula_details),
      updated_by = ${userId}
    WHERE id = ${id}
  `;
}

export async function deleteMeritFormula(id: number) {
  await sql`DELETE FROM merit_formulas WHERE id = ${id}`;
}

// Closing Merits
export async function getClosingMeritsByProgram(programId: number) {
  const result = await sql`
    SELECT cm.*, u.name as created_by_name
    FROM closing_merits cm
    LEFT JOIN users u ON cm.created_by = u.id
    WHERE cm.program_id = ${programId}
    ORDER BY cm.year DESC, cm.gender_category, cm.seat_category
  `;
  return result.rows as ClosingMerit[];
}

export async function getClosingMeritsByUniversity(universityId: number) {
  const result = await sql`
    SELECT cm.*, p.full_program_name, u.name as created_by_name
    FROM closing_merits cm
    JOIN programs p ON cm.program_id = p.id
    LEFT JOIN users u ON cm.created_by = u.id
    WHERE cm.university_id = ${universityId}
    ORDER BY cm.year DESC, p.full_program_name
  `;
  return result.rows;
}

export async function addClosingMerit(data: Omit<ClosingMerit, 'id'>, userId: number) {
  const result = await sql`
    INSERT INTO closing_merits (
      university_id, program_id, year, opening_merit, final_closing_merit,
      total_seats, total_applicants, gender_category, seat_category,
      source_url, notes, verified, created_by, updated_by
    ) VALUES (
      ${data.universityId}, ${data.programId}, ${data.year},
      ${data.openingMerit}, ${data.finalClosingMerit},
      ${data.totalSeats}, ${data.totalApplicants},
      ${data.genderCategory}, ${data.seatCategory},
      ${data.sourceUrl}, ${data.notes}, ${data.verified},
      ${userId}, ${userId}
    )
    ON CONFLICT (university_id, program_id, year, gender_category, seat_category)
    DO UPDATE SET
      opening_merit = EXCLUDED.opening_merit,
      final_closing_merit = EXCLUDED.final_closing_merit,
      total_seats = EXCLUDED.total_seats,
      total_applicants = EXCLUDED.total_applicants,
      source_url = EXCLUDED.source_url,
      notes = EXCLUDED.notes,
      verified = EXCLUDED.verified,
      updated_by = ${userId},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result.rows[0] as ClosingMerit;
}

export async function updateClosingMerit(id: number, data: Partial<ClosingMerit>, userId: number) {
  await sql`
    UPDATE closing_merits
    SET
      year = COALESCE(${data.year}, year),
      opening_merit = COALESCE(${data.openingMerit}, opening_merit),
      final_closing_merit = COALESCE(${data.finalClosingMerit}, final_closing_merit),
      total_seats = COALESCE(${data.totalSeats}, total_seats),
      total_applicants = COALESCE(${data.totalApplicants}, total_applicants),
      gender_category = COALESCE(${data.genderCategory}, gender_category),
      seat_category = COALESCE(${data.seatCategory}, seat_category),
      source_url = COALESCE(${data.sourceUrl}, source_url),
      notes = COALESCE(${data.notes}, notes),
      verified = COALESCE(${data.verified}, verified),
      updated_by = ${userId}
    WHERE id = ${id}
  `;
}

export async function deleteClosingMerit(id: number) {
  await sql`DELETE FROM closing_merits WHERE id = ${id}`;
}

// Statistics
export async function getStats() {
  const result = await sql`
    SELECT
      (SELECT COUNT(*) FROM universities) as universities_count,
      (SELECT COUNT(*) FROM programs) as programs_count,
      (SELECT COUNT(*) FROM closing_merits) as merit_entries_count,
      (SELECT COUNT(*) FROM closing_merits WHERE verified = true) as verified_entries_count,
      (SELECT COUNT(DISTINCT year) FROM closing_merits) as years_covered,
      (SELECT COUNT(DISTINCT university_id) FROM closing_merits) as universities_with_data
  `;
  return result.rows[0];
}
