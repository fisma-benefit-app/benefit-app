BEGIN;

ALTER TABLE projects_app_users
    ADD CONSTRAINT chk_projects_app_users_role_in_project
    CHECK (role_in_project IN ('OWNER', 'MEMBER'));

COMMIT;
