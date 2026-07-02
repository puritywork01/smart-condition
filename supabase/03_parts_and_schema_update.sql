-- 1. Modify condition_records table to support 3 materials/grades/colors
ALTER TABLE condition_records 
  RENAME COLUMN grade TO grade1;

ALTER TABLE condition_records 
  RENAME COLUMN color_no TO color1;

ALTER TABLE condition_records
  ADD COLUMN IF NOT EXISTS grade2 TEXT,
  ADD COLUMN IF NOT EXISTS grade3 TEXT,
  ADD COLUMN IF NOT EXISTS color2 TEXT,
  ADD COLUMN IF NOT EXISTS color3 TEXT;

-- 2. Create part_master table
CREATE TABLE IF NOT EXISTS part_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_code TEXT UNIQUE NOT NULL,
    part_code TEXT,
    part_name TEXT,
    matl1 TEXT,
    grade1 TEXT,
    color1 TEXT,
    matl2 TEXT,
    grade2 TEXT,
    color2 TEXT,
    matl3 TEXT,
    grade3 TEXT,
    color3 TEXT,
    part_weight NUMERIC,
    rn_weight NUMERIC,
    cycle_time NUMERIC,
    mc_ton NUMERIC,
    cavity NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on part_master
ALTER TABLE part_master ENABLE ROW LEVEL SECURITY;

-- Create policies for part_master (For now, allow authenticated users to read, but only Admin/Manager to modify. We can simplify by allowing all authenticated users for now, or enforcing via app)
-- Since auth is handled via the app_users table, we'll allow all operations in Supabase and handle RBAC in the Next.js app.
CREATE POLICY "Allow all operations for authenticated users on part_master" 
ON part_master FOR ALL 
USING (true) WITH CHECK (true);
