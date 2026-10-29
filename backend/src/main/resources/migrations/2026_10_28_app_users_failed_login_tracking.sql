--persistence for failed login attempts count
BEGIN;

ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS failed_login_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

COMMIT;