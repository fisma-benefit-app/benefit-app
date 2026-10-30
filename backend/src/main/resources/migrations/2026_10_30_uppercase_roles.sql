BEGIN;

UPDATE app_users
SET role = CASE role
    WHEN 'user' THEN 'USER'
    WHEN 'admin' THEN 'ADMIN'
END
WHERE role IN ('user', 'admin');

UPDATE projects_app_users
SET role_in_project = CASE role_in_project
    WHEN 'member' THEN 'MEMBER'
    WHEN 'owner' THEN 'OWNER'
END
WHERE role_in_project IN ('member', 'owner');

ALTER TABLE app_users
    ALTER COLUMN role SET DEFAULT 'USER';

ALTER TABLE projects_app_users
    ALTER COLUMN role_in_project SET DEFAULT 'MEMBER';

COMMIT;
