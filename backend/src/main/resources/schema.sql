DROP TABLE IF EXISTS projects_app_users, functional_components, projects, app_users;

CREATE TABLE IF NOT EXISTS app_users
(
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL,
    password        VARCHAR(64) NOT NULL,
    deleted_at      TIMESTAMP(0) -- no fractions of seconds
);

CREATE TABLE IF NOT EXISTS projects
(
    id              BIGSERIAL PRIMARY KEY,
    project_name    VARCHAR(255) NOT NULL,
    version         BIGINT NOT NULL,
    version_date    TIMESTAMP NOT NULL,
    total_points    DECIMAL NOT NULL,
    created_at      TIMESTAMP NOT NULL,
    edited_at       TIMESTAMP(0),
    deleted_at      TIMESTAMP(0)
);

CREATE TABLE IF NOT EXISTS functional_components
(
    id                      BIGSERIAL PRIMARY KEY,
    title                   VARCHAR(255),
    description             VARCHAR(1000),
    class_name              VARCHAR(255),
    component_type          VARCHAR(255),
    data_elements           BIGINT,
    reading_references      BIGINT,
    writing_references      BIGINT,
    functional_multiplier   BIGINT,
    operations              BIGINT,
    degree_of_completion    DECIMAL,
    previous_fc_id          BIGINT,
    order_position          BIGINT NOT NULL DEFAULT 0,
    project_id              BIGINT NOT NULL REFERENCES projects (id),
    deleted_at              TIMESTAMP(0)
);

CREATE TABLE IF NOT EXISTS projects_app_users
(
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects (id),
    app_user_id     BIGINT NOT NULL REFERENCES app_users (id)
)

