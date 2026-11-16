BEGIN;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS family_id UUID;

-- Archiving copied the original creation timestamp. Independently created rows used
-- the same time for creation and version creation (two clock reads in older releases).
-- Recover only a single, ordered version chain per creation timestamp, including
-- soft-deleted rows. A same-second collision, gaps, or uncertain lineage stays isolated.
WITH legacy_chains AS (
    SELECT created_at, gen_random_uuid() AS family_id
    FROM projects
    GROUP BY created_at
    HAVING COUNT(*) > 1
       AND COUNT(family_id) = 0
       AND COUNT(DISTINCT project_name) = 1
       AND COUNT(*) FILTER (WHERE version = 1) = 1
       AND COUNT(*) FILTER (WHERE deleted_at IS NULL) =
           COUNT(DISTINCT version) FILTER (WHERE deleted_at IS NULL)
       AND MIN(version) = 1
       AND MAX(version) = COUNT(DISTINCT version)
       AND MIN(id) = MIN(id) FILTER (WHERE version = 1)
       AND BOOL_AND(
           CASE WHEN version = 1 THEN created_at = version_created_at
                ELSE version_created_at > created_at + INTERVAL '1 second' END
       )
)
UPDATE projects AS project
SET family_id = chain.family_id
FROM legacy_chains AS chain
WHERE project.created_at = chain.created_at AND project.family_id IS NULL;

UPDATE projects SET family_id = gen_random_uuid() WHERE family_id IS NULL;

ALTER TABLE projects
    ALTER COLUMN family_id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN family_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_family_id ON projects (family_id);

COMMIT;
