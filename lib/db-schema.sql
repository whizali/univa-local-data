-- Merit Data Collection Database Schema

-- Users table (3 team members)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Universities table
CREATE TABLE IF NOT EXISTS universities (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(50) NOT NULL,
  website VARCHAR(255),
  type VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Merit formulas table
CREATE TABLE IF NOT EXISTS merit_formulas (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  formula_name VARCHAR(255),
  matric_weight DECIMAL(5,2),
  intermediate_weight DECIMAL(5,2),
  entry_test_weight DECIMAL(5,2),
  formula_details JSONB,
  applicable_programs TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  program_id INTEGER,
  faculty VARCHAR(255),
  department VARCHAR(255),
  degree VARCHAR(50),
  full_program_name VARCHAR(255) NOT NULL,
  campus_id INTEGER,
  campus_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(university_id, program_id)
);

-- Closing merits table (main data collection target)
CREATE TABLE IF NOT EXISTS closing_merits (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
  opening_merit DECIMAL(5,2),
  final_closing_merit DECIMAL(5,2) NOT NULL CHECK (final_closing_merit >= 0 AND final_closing_merit <= 100),
  total_seats INTEGER,
  total_applicants INTEGER,
  gender_category VARCHAR(50),
  seat_category VARCHAR(100),
  source_url TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(university_id, program_id, year, gender_category, seat_category)
);

-- Merit lists (multiple lists per year)
CREATE TABLE IF NOT EXISTS merit_lists (
  id SERIAL PRIMARY KEY,
  closing_merit_id INTEGER REFERENCES closing_merits(id) ON DELETE CASCADE,
  list_number INTEGER NOT NULL,
  publish_date DATE,
  closing_merit DECIMAL(5,2) NOT NULL,
  seats_offered INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  UNIQUE(closing_merit_id, list_number)
);

-- Activity log for tracking changes
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_universities_abbreviation ON universities(abbreviation);
CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_closing_merits_university ON closing_merits(university_id);
CREATE INDEX IF NOT EXISTS idx_closing_merits_year ON closing_merits(year);
CREATE INDEX IF NOT EXISTS idx_closing_merits_program ON closing_merits(program_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merit_formulas_updated_at BEFORE UPDATE ON merit_formulas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_closing_merits_updated_at BEFORE UPDATE ON closing_merits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
