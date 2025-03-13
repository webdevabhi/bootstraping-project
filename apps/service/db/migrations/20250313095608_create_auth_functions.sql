-- migrate:up
-- Create function to hash password
CREATE OR REPLACE FUNCTION app_private.hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql STRICT SECURITY DEFINER;

-- Create function to verify password
CREATE OR REPLACE FUNCTION app_private.verify_password(email TEXT, password TEXT) RETURNS app_public.users AS $$
DECLARE
    user_record app_public.users;
BEGIN
    SELECT * INTO user_record
    FROM app_public.users
    WHERE users.email = verify_password.email
    AND users.password_hash = crypt(password, users.password_hash);
    
    RETURN user_record;
END;
$$ LANGUAGE plpgsql STRICT SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION app_private.verify_password(TEXT, TEXT) TO app_anonymous;
GRANT EXECUTE ON FUNCTION app_private.hash_password(TEXT) TO app_anonymous;

-- migrate:down
DROP FUNCTION IF EXISTS app_private.verify_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS app_private.hash_password(TEXT); 