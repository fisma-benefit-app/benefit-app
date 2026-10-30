BEGIN;

-- projects_app_users has no assignment timestamp, so its generated id is used
-- to identify the first user assigned to each project.
WITH ranked_assignments AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY id) AS assignment_order
    FROM projects_app_users
)
UPDATE projects_app_users AS project_user
SET role_in_project = CASE
    WHEN ranked_assignments.assignment_order = 1 THEN 'OWNER'
    ELSE 'MEMBER'
END
FROM ranked_assignments
WHERE project_user.id = ranked_assignments.id
  AND project_user.role_in_project IS DISTINCT FROM CASE
      WHEN ranked_assignments.assignment_order = 1 THEN 'OWNER'
      ELSE 'MEMBER'
  END;

COMMIT;