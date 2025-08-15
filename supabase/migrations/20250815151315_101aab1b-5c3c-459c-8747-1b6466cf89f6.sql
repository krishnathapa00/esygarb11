-- Configure JWT settings for 7-day expiry
-- This updates the JWT configuration to support longer session durations

-- Update auth configuration for longer JWT expiry (7 days = 604800 seconds)
INSERT INTO auth.config (parameter, value) 
VALUES ('JWT_EXPIRY', '604800')
ON CONFLICT (parameter) 
DO UPDATE SET value = '604800';

-- Set refresh token expiry to 7 days as well
INSERT INTO auth.config (parameter, value) 
VALUES ('REFRESH_TOKEN_ROTATION_ENABLED', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = 'true';

-- Configure session timeout for 7 days
INSERT INTO auth.config (parameter, value) 
VALUES ('SESSION_TIMEOUT', '604800')
ON CONFLICT (parameter) 
DO UPDATE SET value = '604800';