-- Run this after fixing any existing rows where functional_multiplier < 1
-- (e.g. rows inserted directly via SQL, bypassing app-level validation),
-- otherwise ADD CONSTRAINT will fail since it validates existing rows.
BEGIN;

ALTER TABLE functional_components
    ADD CONSTRAINT functional_components_functional_multiplier_check
    CHECK (functional_multiplier >= 1);

COMMIT;
