-- Add last_login column to users table
-- Run this in Vercel Postgres Query editor OR locally

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update existing users to have NULL last_login initially
-- (will be set on next successful login)
