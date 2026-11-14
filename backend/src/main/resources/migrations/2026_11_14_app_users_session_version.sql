-- Apply before deploying the session-version-aware backend. Legacy JWTs are version zero.
ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS session_version BIGINT NOT NULL DEFAULT 0
    CHECK (session_version >= 0);
