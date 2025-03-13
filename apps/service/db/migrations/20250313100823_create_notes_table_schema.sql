-- migrate:up
-- Create the post table in app_public schema
CREATE TABLE app_public.post (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES app_public.users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant table permissions
GRANT ALL ON app_public.post TO app_admin;
GRANT SELECT, UPDATE ON app_public.post TO app_client;
GRANT SELECT ON app_public.post TO app_anonymous;

-- Enable Row Level Security
ALTER TABLE app_public.post ENABLE ROW LEVEL SECURITY;

-- Create policies for different roles
-- Admin can do everything
CREATE POLICY admin_all ON app_public.post
    FOR ALL
    TO app_admin
    USING (true);

-- Authenticated users can view and update their own records
CREATE POLICY client_select ON app_public.post
    FOR SELECT
    TO app_client
    USING (user_id = (app_private.current_user_id())::UUID);

CREATE POLICY client_update ON app_public.post
    FOR UPDATE
    TO app_client
    USING (user_id = (app_private.current_user_id())::UUID);

-- Anonymous users can only view public posts
CREATE POLICY anonymous_select ON app_public.post
    FOR SELECT
    TO app_anonymous
    USING (is_public = true);

-- migrate:down
DROP POLICY IF EXISTS admin_all ON app_public.post;
DROP POLICY IF EXISTS client_select ON app_public.post;
DROP POLICY IF EXISTS client_update ON app_public.post;
DROP POLICY IF EXISTS anonymous_select ON app_public.post;
DROP POLICY IF EXISTS admin_insert ON app_public.post;
ALTER TABLE app_public.post DISABLE ROW LEVEL SECURITY;
DROP TABLE IF EXISTS app_public.post CASCADE;
