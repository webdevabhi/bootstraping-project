-- migrate:up
-- Create the users table in app_public schema
CREATE TABLE app_public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'app_client',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_role CHECK (role IN ('app_admin', 'app_client'))
);

-- Grant permissions for the users table
-- Allow only select for login
GRANT SELECT ON TABLE app_public.users TO PUBLIC;

-- Allow authenticated users to update their own records
ALTER TABLE app_public.users ENABLE ROW LEVEL SECURITY;

-- Policy for update only (removed select policy since we want all records readable)
CREATE POLICY update_own_user ON app_public.users
    FOR UPDATE
    TO app_client
    USING (id = (app_private.current_user_id())::UUID)
    WITH CHECK (id = (app_private.current_user_id())::UUID);

-- Grant full access to admin role
GRANT ALL ON TABLE app_public.users TO app_admin;

-- migrate:down
DROP TABLE IF EXISTS app_public.users CASCADE;
