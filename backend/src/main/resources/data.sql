DELETE FROM  projects_app_users;
DELETE FROM  functional_components;
DELETE FROM  app_users;
DELETE FROM  projects;

INSERT INTO app_users (id, username, password, deleted_at)
VALUES  (1, 'user', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue', NULL),
        (2, 'user2', '$2a$12$4JuHucPwX0CfxAeRD87I/OMrD8SndXaptn3Yp2MJeOiLklIbJ3XjW', NULL),
        (3, 'user3', '$2a$12$tJY5QjbeRPU4HN0hGV48HOu2tIV9dMVCqyqJxNOtjsuNQCbNkUeza', NULL),
        (4, 'user4', '$2a$12$RTbuJ9r1PLJxd.anzqEzGuxNMlnRe0DylL0v6fgrzNzCTEVDzz1ci', NULL),
        (5, 'user5', '$2a$12$kHh09CQz9p0RLGMXnBkyS.fueTfRcOqI9Q2MvI8eyNcDjiC7a5Ada', NULL),
        (6, 'jukka', '$2a$12$HalfqF43RCkPeRRJ7EkQMOjWcjDqLZ4udbTC6DYZRR7C6P0kRpoCm', NULL),
        (7, 'heikki', '$2a$12$VvPmVx1yxpPVHAEerqvO1.Pmsp96pxLlsw622r9Zun5r0X9NIuNhy', NULL),
        (8, 'altti', '$2a$12$UVmCG.ySaTe6rWo4X5G2yOFpMuu.Mo89GbmmxJzJOUHpnKUAcXfJ.', NULL);

INSERT INTO projects (id, project_name, version, total_points, created_at, version_created_at, updated_at, deleted_at)
VALUES  (1, 'project-x', 1, 120.20, '2025-01-28T17:23:19', '2025-01-28T17:23:19', '2025-01-28T17:23:19', NULL),
        (2, 'test-project', 1, 200.34, '2025-02-19T18:28:33', '2025-02-19T18:28:33','2025-01-28T17:23:19', NULL),
        (3, 'users another project', 1, 32.00, '2025-01-29T19:19:22', '2025-01-29T19:19:22', '2025-01-28T17:23:19', NULL);

INSERT INTO functional_components (
    id,
    title,
    description,
    class_name,
    component_type,
    data_elements,
    reading_references,
    writing_references,
    functional_multiplier,
    operations,
    degree_of_completion,
    previous_fc_id,
    order_position,
    project_id,
    deleted_at
)
VALUES  (1, 'Hakijan syöte', 'Kenttä hakijan syötteelle', 'Interactive end-user input service', '1-functional', 2, 4, 2, NULL, 3, 0.12, NULL, 1, 1, NULL),
        (2, 'Lukumäärän valintapainike', 'Valintapainike lukumäärälle', 'Interactive end-user input service', '1-functional', 2, 4, 2, NULL, 3, 0.34, 1, 2, 2, NULL),
        (3, 'Lähetä-painike', 'Painikkeella käyttäjä lähettää tiedot', 'Interactive end-user input service', '1-functional', 2, 4, 2, NULL, 3, 0.5, 2, 3, 1, NULL);

INSERT INTO projects_app_users (id, project_id, app_user_id)
VALUES  (1, 1, 1),
        (2, 2, 1),
        (3, 3, 1);

SELECT setval('app_users_id_seq', (SELECT MAX(id) FROM app_users));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('functional_components_id_seq', (SELECT MAX(id) FROM functional_components));
SELECT setval('projects_app_users_id_seq', (SELECT MAX(id) FROM projects_app_users));