BEGIN;

ALTER TABLE projects_app_users
    ADD COLUMN role_in_project VARCHAR(20) NOT NULL DEFAULT 'member';

COMMIT;
