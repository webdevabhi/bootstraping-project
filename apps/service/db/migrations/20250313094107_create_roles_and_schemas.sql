-- migrate:up

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS app_private;
CREATE SCHEMA IF NOT EXISTS app_public;

-- Create roles
CREATE ROLE app_anonymous;
CREATE ROLE app_admin;
CREATE ROLE app_client;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA app_public TO app_anonymous, app_admin, app_client;

-- Create authentication function in private schema
CREATE OR REPLACE FUNCTION app_private.set_auth_role(role text) RETURNS void AS $$
BEGIN
  -- Ensure role exists and is valid
  IF role NOT IN ('app_anonymous', 'app_admin', 'app_client') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  -- Set role
  EXECUTE format('SET ROLE %I', role);
END;
$$ LANGUAGE plpgsql STRICT SECURITY DEFINER;

-- Create current_user_id function in app_private schema
CREATE OR REPLACE FUNCTION app_private.current_user_id() 
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- migrate:down
DROP EXTENSION IF EXISTS pgcrypto;
DROP FUNCTION IF EXISTS app_private.set_auth_role(text);
DROP FUNCTION IF EXISTS app_private.current_user_id();
DROP FUNCTION IF EXISTS app_public.current_user_id();
DROP SCHEMA IF EXISTS app_private CASCADE;
DROP SCHEMA IF EXISTS app_public CASCADE;
DROP ROLE IF EXISTS app_anonymous;
DROP ROLE IF EXISTS app_admin;
DROP ROLE IF EXISTS app_client; 