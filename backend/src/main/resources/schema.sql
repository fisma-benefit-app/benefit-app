drop table if exists project, functional_component, app_user;

create table if not exists app_user
(
    id       bigserial primary key,
    username text not null,
    password text not null
);

create table if not exists project
(
    id            bigserial primary key,
    project_name  text      not null,
    creation_date timestamp not null,
    total_points  decimal   not null,
    app_user_id   bigint    not null references app_user (id)
);

create table if not exists functional_component
(
    id                    bigserial primary key,
    class_name            text    not null,
    component_type        text    not null,
    data_element          integer not null,
    reading_references     integer,
    writing_references    integer,
    functional_multiplier integer,
    operations            integer,
    project_id            bigint  not null references project (id)
)



