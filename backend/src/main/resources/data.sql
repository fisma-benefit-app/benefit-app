delete
from project;
delete
from functional_component;

insert into app_user (id, username, password)
values (23, 'user', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (13, 'john', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue');

insert into project (id, project_name, version, created_date, edited_date, total_points)
values (99, 'project-x', 1, '2025-01-28T17:23:19', '2025-01-28T17:23:19', 120.20),
       (100, 'john-project', 1, '2025-02-19T18:28:33', '2025-02-19T18:28:33', 200.34),
       (101, 'users another project', 3, '2025-01-29T19:19:22', '2025-01-29T19:19:22',32);

insert into functional_component (id, class_name, component_type, data_elements, reading_references, writing_references,
                                  functional_multiplier, operations, degree_of_completion, comment,  project_id)
values (1, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 0.12, 'hakijan syöte', 99),
       (5, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 0.34, 'montako tulee', 100),
       (6, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 0.5, 'valittavana kaupungit', 101);


insert into project_app_user (project_id, app_user_id)
values (99, 23),
       (100, 13),
       (101, 23);


SELECT setval('app_user_id_seq', (SELECT MAX(id) FROM app_user));
SELECT setval('project_id_seq', (SELECT MAX(id) FROM project));
SELECT setval('functional_component_id_seq', (SELECT MAX(id) FROM functional_component));