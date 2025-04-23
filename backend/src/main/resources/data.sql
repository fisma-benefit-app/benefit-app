delete
from project;
delete
from functional_component;

insert into app_user (id, username, password)
values (23, 'user', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (13, 'john', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (63, 'user2', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (64, 'user3', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (65, 'user4', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (66, 'user5', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (67, 'user6', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (68, 'user7', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (69, 'user8', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (70, 'user9', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (71, 'user10', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (72, 'user11', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (73, 'user12', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (74, 'user13', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (75, 'user14', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (76, 'user15', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (77, 'user16', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (78, 'user17', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (79, 'user18', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (80, 'user19', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue'),
       (81, 'user20', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue');
       
insert into project (id, project_name, version, created_date, version_date, edited_date,  total_points)
values (99, 'project-x', 1, '2025-01-28T17:23:19', '2025-01-28T17:23:19', '2025-01-28T17:23:19', 120.20),
       (100, 'john-project', 1, '2025-02-19T18:28:33', '2025-02-19T18:28:33', '2025-01-28T17:23:19', 200.34),
       (101, 'users another project', 3, '2025-01-29T19:19:22', '2025-01-29T19:19:22', '2025-01-28T17:23:19',32);

insert into functional_component (id, class_name, component_type, data_elements, reading_references, writing_references,
                                  functional_multiplier, operations, degree_of_completion, comment, previous_FC_id , project_id)
values (1, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 0.12, 'hakijan syöte', 1, 99),
       (5, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 0.34, 'montako tulee', 5, 100),
       (6, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 0.5, 'valittavana kaupungit', 6, 101);


insert into project_app_user (project_id, app_user_id)
values (99, 23),
       (100, 13),
       (101, 23);


SELECT setval('app_user_id_seq', (SELECT MAX(id) FROM app_user));
SELECT setval('project_id_seq', (SELECT MAX(id) FROM project));
SELECT setval('functional_component_id_seq', (SELECT MAX(id) FROM functional_component));