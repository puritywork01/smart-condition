-- Create enum for condition type
CREATE TYPE condition_type AS ENUM ('Master', 'Mass Production');

-- 1. Main Table (Header details)
CREATE TABLE IF NOT EXISTS condition_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type condition_type NOT NULL DEFAULT 'Mass Production',
    is_active_master BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    id_code TEXT,
    mc_no TEXT,
    part_name TEXT,
    part_code TEXT,
    mc_ton TEXT,
    part_weight NUMERIC,
    rn_weight NUMERIC,
    cycle_time NUMERIC,
    matl1 TEXT,
    matl2 TEXT,
    matl3 TEXT,
    grade TEXT,
    color_no TEXT
);

-- 2. Clamping Unit
CREATE TABLE IF NOT EXISTS clamping_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES condition_records(id) ON DELETE CASCADE UNIQUE,
    -- Mold Close
    mc_prs_1st NUMERIC, mc_spd_1st NUMERIC, mc_pos_1st NUMERIC,
    mc_prs_2nd NUMERIC, mc_spd_2nd NUMERIC, mc_pos_2nd NUMERIC,
    mc_prs_3rd NUMERIC, mc_spd_3rd NUMERIC, mc_pos_3rd NUMERIC,
    mc_prs_low NUMERIC, mc_spd_low NUMERIC, mc_pos_low NUMERIC,
    mc_prs_hi NUMERIC, mc_spd_hi NUMERIC, mc_pos_hi NUMERIC,
    -- Mold Open
    mo_prs_1st NUMERIC, mo_spd_1st NUMERIC, mo_pos_1st NUMERIC,
    mo_prs_2nd NUMERIC, mo_spd_2nd NUMERIC, mo_pos_2nd NUMERIC,
    mo_prs_3rd NUMERIC, mo_spd_3rd NUMERIC, mo_pos_3rd NUMERIC,
    mo_prs_4th NUMERIC, mo_spd_4th NUMERIC, mo_pos_4th NUMERIC,
    mo_prs_5th NUMERIC, mo_spd_5th NUMERIC, mo_pos_5th NUMERIC,
    -- Ejector
    ej_prs_1st NUMERIC, ej_spd_1st NUMERIC, ej_pos_1st NUMERIC,
    ej_prs_2nd NUMERIC, ej_spd_2nd NUMERIC, ej_pos_2nd NUMERIC,
    ej_prs_3rd NUMERIC, ej_spd_3rd NUMERIC, ej_pos_3rd NUMERIC,
    ej_prs_4th NUMERIC, ej_spd_4th NUMERIC, ej_pos_4th NUMERIC,
    ej_delay_time NUMERIC
);

-- 3. Injection Unit
CREATE TABLE IF NOT EXISTS injection_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES condition_records(id) ON DELETE CASCADE UNIQUE,
    -- Holding
    hl_prs_1st NUMERIC, hl_spd_1st NUMERIC, hl_time_1st NUMERIC,
    hl_prs_2nd NUMERIC, hl_spd_2nd NUMERIC, hl_time_2nd NUMERIC,
    hl_prs_3rd NUMERIC, hl_spd_3rd NUMERIC, hl_time_3rd NUMERIC,
    -- Injection
    ij_prs_1st NUMERIC, ij_spd_1st NUMERIC, ij_pos_1st NUMERIC, ij_time_1st NUMERIC,
    ij_prs_2nd NUMERIC, ij_spd_2nd NUMERIC, ij_pos_2nd NUMERIC, ij_time_2nd NUMERIC,
    ij_prs_3rd NUMERIC, ij_spd_3rd NUMERIC, ij_pos_3rd NUMERIC, ij_time_3rd NUMERIC,
    ij_prs_4th NUMERIC, ij_spd_4th NUMERIC, ij_pos_4th NUMERIC, ij_time_4th NUMERIC,
    ij_prs_5th NUMERIC, ij_spd_5th NUMERIC, ij_pos_5th NUMERIC, ij_time_5th NUMERIC,
    -- Screw Condition
    sc_back_pressure NUMERIC,
    sc_screw_speed NUMERIC,
    sc_suck_back NUMERIC
);

-- 4. Temperature Unit
CREATE TABLE IF NOT EXISTS temperature_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES condition_records(id) ON DELETE CASCADE UNIQUE,
    -- Barrel
    nozzle NUMERIC,
    zone1 NUMERIC, zone2 NUMERIC, zone3 NUMERIC, zone4 NUMERIC,
    zone5 NUMERIC, zone6 NUMERIC, zone7 NUMERIC, zone8 NUMERIC,
    -- Hot Runner (Can use zone1 to zone8 or additional fields if needed, simplifying to one hot runner or 8 zones)
    hr_zone1 NUMERIC, hr_zone2 NUMERIC, hr_zone3 NUMERIC, hr_zone4 NUMERIC,
    hr_zone5 NUMERIC, hr_zone6 NUMERIC, hr_zone7 NUMERIC, hr_zone8 NUMERIC
);

-- 5. Cooling Unit
CREATE TABLE IF NOT EXISTS cooling_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES condition_records(id) ON DELETE CASCADE UNIQUE,
    cavity_cold_water NUMERIC,
    cavity_hot_water NUMERIC,
    core_cold_water NUMERIC,
    core_hot_water NUMERIC,
    cooling_time NUMERIC
);

-- Disable RLS for now for easier development (can enable later)
ALTER TABLE condition_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE clamping_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE injection_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_units DISABLE ROW LEVEL SECURITY;
