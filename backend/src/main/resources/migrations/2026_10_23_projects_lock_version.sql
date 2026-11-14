-- Optimistic locking: a save carrying an outdated lock_version is rejected instead of silently
-- overwriting a newer save (two browser tabs, several editors).
BEGIN;
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS lock_version BIGINT NOT NULL DEFAULT 0;
COMMIT;