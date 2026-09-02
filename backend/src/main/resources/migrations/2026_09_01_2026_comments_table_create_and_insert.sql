BEGIN;

CREATE TABLE IF NOT EXISTS comments
(
    id          BIGSERIAL PRIMARY KEY,
    text        VARCHAR(2000) NOT NULL,
    project_id  BIGINT NOT NULL REFERENCES projects (id)
);

COMMIT;