-- Table for Application Users
CREATE TABLE IF NOT EXISTS app_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Technician', -- 'Admin', 'Manager', 'Technician'
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin account
INSERT INTO app_users (username, password, role, permissions)
VALUES ('admin', 'admin123', 'Admin', '["create_master", "analysis", "download_pdf", "delete"]')
ON CONFLICT (username) DO NOTHING;
