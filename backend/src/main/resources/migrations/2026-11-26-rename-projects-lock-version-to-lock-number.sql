BEGIN;

ALTER TABLE projects
    RENAME COLUMN lock_version TO lock_number;

COMMIT;