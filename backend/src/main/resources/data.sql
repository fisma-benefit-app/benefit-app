delete
from project;
delete
from functional_component;

insert into app_user (id, username, password)
values (23, 'testi-user', 'passw');

insert into project (id, project_name, creation_date, app_user_id)
values (99, 'project-x', 'tänään', 23);

insert into functional_component (id, class_name, component_type, data_element, reading_reference, writing_references,
                                  functional_multiplier, operations, project_id)
values (1, 'Interactive end-user input service', '1-functional', 2, 4, 2, null, 3, 99);