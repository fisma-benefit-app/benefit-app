drop table if exists project, functional_component, app_user, project_app_user;

create table if not exists app_user
(
    id       bigserial primary key,
    username text not null,
    password text not null
);

create table if not exists project
(
    id           bigserial primary key,
    project_name text      not null,
    version      integer   not null,
    created_date timestamp not null,
    total_points decimal   not null
);

create table if not exists functional_component
(
    id                    bigserial primary key,
    class_name            text,
    component_type        text,
    data_elements         integer,
    reading_references    integer,
    writing_references    integer,
    functional_multiplier integer,
    operations            integer,
    degree_of_completion  decimal,
    comment               text,
    project_id            bigint not null references project (id)
);

create table if not exists project_app_user
(
    project_id  bigint not null references project (id),
    app_user_id bigint not null references app_user (id)
)

