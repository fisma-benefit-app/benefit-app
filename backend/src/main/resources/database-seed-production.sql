DELETE FROM  projects_app_users;
DELETE FROM  functional_components;
DELETE FROM  app_users;
DELETE FROM  projects;

INSERT INTO app_users (id, username, password, deleted_at)
VALUES  (1, 'user', '$2a$12$HKOdaTyz4177IDXr5bhtZuack9SYFe02sZOHP2/8cwAa91ShbKIiO', NULL),
        (2, 'user2', '$2a$12$Vc5WSe5mXF45EvtrFcUPmu5FRVlj7b4Cd5b68a4TgqG2SqDbTmADK', NULL),
        (3, 'user3', '$2a$12$nKdrHeXT4qYT3OBTJOYJG.ADDH/F/XAcmbxpFajn6cHfNPX8enF6u', NULL),
        (4, 'user4', '$2a$12$Mz17lunXaRgsTlz0eDDq3uSCcmVr2RlY0hLn/l.SX6XCwMpHVsFZS', NULL),
        (5, 'user5', '$2a$12$.u1O5CWnUc1vklHEQxMmv.jtowTSbjteESiH1c0YR3rMTAXMkjRoa', NULL),
        (6, 'jukka', '$2a$12$1sHTuiKwcCI6okpyq0mMe.FZGrTf1nFaukc/G1jDJ5iZIyPyqb7Mm', NULL),
        (7, 'heikki', '$2a$12$wnFui8206hSPWd9r6mf9pOuWbZBQKDO92TBFrJEYFvf/p.Rw3O.ju', NULL),
        (8, 'altti', '$2a$12$WLze.ZRabl4SXqG.K6KXD.0hzbeAAZ.M1ZRx3jmGlhSevIiBoMQNS', NULL);

INSERT INTO projects (id, project_name, version, created_at, version_created_at, updated_at, deleted_at)
VALUES  (1, 'project-x', 1, NOW(), NOW(), NOW(), NULL),
        (2, 'test-project', 1, NOW(), NOW(), NOW(), NULL),
        (3, 'users another project', 1, NOW(), NOW(), NOW(), NULL);

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
    is_mla,
    parent_fc_id,
    project_id,
    deleted_at
)
VALUES  (1, 'Hakijan syöte', 'Kenttä hakijan syötteelle', 'Interactive end-user input service', '1-functional', 2, 4, 2, NULL, 3, 0.12, NULL, 1, FALSE, NULL, 1, NULL),
        (2, 'Lukumäärän valintapainike', 'Valintapainike lukumäärälle', 'Interactive end-user input service', '1-functional', 2, 4, 2, NULL, 3, 0.34, 1, 2, FALSE, NULL, 2, NULL),
        (3, 'Lähetä-painike', 'Painikkeella käyttäjä lähettää tiedot', 'Interactive end-user input service', '1-functional', 2, 4, 2, NULL, 3, 0.5, 2, 3, FALSE, NULL, 1, NULL);

INSERT INTO projects_app_users (id, project_id, app_user_id)
VALUES  (1, 1, 1),
        (2, 2, 1),
        (3, 3, 1);

SELECT setval('app_users_id_seq', (SELECT MAX(id) FROM app_users));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('functional_components_id_seq', (SELECT MAX(id) FROM functional_components));
SELECT setval('projects_app_users_id_seq', (SELECT MAX(id) FROM projects_app_users));