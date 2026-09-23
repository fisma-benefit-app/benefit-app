-- Raises the functional component description limit from 1000 to 10000 characters.
-- Widening a VARCHAR is a metadata-only change in Postgres, so existing rows are untouched.
BEGIN;

ALTER TABLE functional_components
    ALTER COLUMN description TYPE VARCHAR(10000);

COMMIT;
