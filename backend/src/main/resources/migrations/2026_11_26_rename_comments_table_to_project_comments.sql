BEGIN;

ALTER TABLE comments RENAME TO project_comments;

COMMIT;