-- Adds the "[Kitchen sink] Every component type + MLA" reference project to a database that is
-- NOT seeded (the Heroku testing database). Issue #793.
--
-- The rows are copied from backend/src/main/resources/database-seed-dev.sql (project 4). Unlike
-- that file, this script never deletes anything and never uses the seed's hardcoded ids: the
-- project and every component get fresh ids from the table sequences, parent_fc_id of the MLA
-- sub-components is remapped to the new parent ids, and the project is linked to one existing
-- user. It runs in a single transaction, so it either inserts everything or nothing.
--
-- Usage: pass the owner as the psql variable owner_username (an existing, non-deleted user on the
-- target database). The file itself never needs editing. From the repo root:
--
--   (echo "\set owner_username 'some-user'"; cat documents/test-data/kitchen_sink_project.sql) \
--     | heroku pg:psql HEROKU_TESTING_POSTGRES_DB_NAME --app=fisma-benefit-app-testing
--
-- or, with a local psql and a connection string:
--
--   psql "$DATABASE_URL" -v owner_username=some-user -f documents/test-data/kitchen_sink_project.sql
--
-- It refuses to run if a non-deleted project with the same name already exists, so a second run
-- fails loudly instead of adding a duplicate. Soft-delete the old copy first if you want to redo it.
--
-- Requires the schema migrations up to 2026_09_23_functional_components_description_length.sql.

\set ON_ERROR_STOP on

\if :{?owner_username}
\else
    \echo 'owner_username is not set. See the usage notes at the top of this file.'
    \quit
\endif

BEGIN;

-- DO blocks can't see psql variables, so hand the owner over as a transaction-local setting.
SELECT set_config('kitchen_sink.owner_username', :'owner_username', true);

-- Staging copy of the seed rows, still carrying the seed's ids (100-154).
CREATE TEMP TABLE kitchen_sink_stage (
    id bigint, title varchar(255), description varchar(10000), class_name varchar(255),
    component_type varchar(255), data_elements bigint, reading_references bigint,
    writing_references bigint, functional_multiplier bigint, operations bigint,
    degree_of_completion decimal, previous_fc_id bigint, order_position bigint, is_mla boolean,
    parent_fc_id bigint, sub_component_type varchar(50), is_readonly boolean, project_id bigint,
    deleted_at timestamp(0)
) ON COMMIT DROP;

INSERT INTO kitchen_sink_stage (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
VALUES
-- Interactive end-user navigation and query service (dataElements, readingReferences only)
(100, 'Function designators', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "function designators".', 'Interactive end-user navigation and query service', 'function designators', 1, 0, NULL, NULL, NULL, 0.0, NULL, 0, FALSE, NULL, NULL, FALSE, 4, NULL),
(101, 'Log-in log-out functions', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "log-in log-out functions".', 'Interactive end-user navigation and query service', 'log-in log-out functions', 2, 1, NULL, NULL, NULL, 0.1, NULL, 1, FALSE, NULL, NULL, FALSE, 4, NULL),
(102, 'Function lists', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "function lists".', 'Interactive end-user navigation and query service', 'function lists', 3, 2, NULL, NULL, NULL, 0.3, NULL, 2, FALSE, NULL, NULL, FALSE, 4, NULL),
(103, 'Selection lists', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "selection lists".', 'Interactive end-user navigation and query service', 'selection lists', 4, 3, NULL, NULL, NULL, 0.7, NULL, 3, FALSE, NULL, NULL, FALSE, 4, NULL),
(104, 'Data inquiries', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "data inquiries".', 'Interactive end-user navigation and query service', 'data inquiries', 5, 0, NULL, NULL, NULL, 0.9, NULL, 4, FALSE, NULL, NULL, FALSE, 4, NULL),
(105, 'Generation indicators', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "generation indicators".', 'Interactive end-user navigation and query service', 'generation indicators', 1, 1, NULL, NULL, NULL, 1.0, NULL, 5, FALSE, NULL, NULL, FALSE, 4, NULL),
(106, 'Browsing lists', 'Kitchen-sink reference component for class "Interactive end-user navigation and query service", type "browsing lists". A real MLA-enabled example of this type is component 140 below.', 'Interactive end-user navigation and query service', 'browsing lists', 2, 2, NULL, NULL, NULL, 0.0, NULL, 6, FALSE, NULL, NULL, FALSE, 4, NULL),
-- Interactive end-user input service (dataElements, readingReferences, writingReferences, functionalMultiplier)
(107, '1-functional', 'Kitchen-sink reference component for class "Interactive end-user input service", type "1-functional".', 'Interactive end-user input service', '1-functional', 3, 3, 0, 1, NULL, 0.1, NULL, 7, FALSE, NULL, NULL, FALSE, 4, NULL),
(108, '2-functional', 'Kitchen-sink reference component for class "Interactive end-user input service", type "2-functional".', 'Interactive end-user input service', '2-functional', 4, 0, 1, 2, NULL, 0.3, NULL, 8, FALSE, NULL, NULL, FALSE, 4, NULL),
(109, '3-functional', 'Kitchen-sink reference component for class "Interactive end-user input service", type "3-functional".', 'Interactive end-user input service', '3-functional', 5, 1, 2, 3, NULL, 0.7, NULL, 9, FALSE, NULL, NULL, FALSE, 4, NULL),
-- Non-interactive end-user output service (dataElements, readingReferences only)
(110, 'Forms', 'Kitchen-sink reference component for class "Non-interactive end-user output service", type "forms".', 'Non-interactive end-user output service', 'forms', 1, 2, NULL, NULL, NULL, 0.9, NULL, 10, FALSE, NULL, NULL, FALSE, 4, NULL),
(111, 'Emails for text messages', 'Kitchen-sink reference component for class "Non-interactive end-user output service", type "emails for text messages".', 'Non-interactive end-user output service', 'emails for text messages', 2, 3, NULL, NULL, NULL, 1.0, NULL, 11, FALSE, NULL, NULL, FALSE, 4, NULL),
(112, 'Monitor screens', 'Kitchen-sink reference component for class "Non-interactive end-user output service", type "monitor screens".', 'Non-interactive end-user output service', 'monitor screens', 3, 0, NULL, NULL, NULL, 0.0, NULL, 12, FALSE, NULL, NULL, FALSE, 4, NULL),
-- Interface service to other applications (dataElements, readingReferences only)
(113, 'Messages to other applications', 'Kitchen-sink reference component for class "Interface service to other applications", type "messages to other applications".', 'Interface service to other applications', 'messages to other applications', 4, 1, NULL, NULL, NULL, 0.1, NULL, 13, FALSE, NULL, NULL, FALSE, 4, NULL),
(114, 'Batch records to other applications', 'Kitchen-sink reference component for class "Interface service to other applications", type "batch records to other applications".', 'Interface service to other applications', 'batch records to other applications', 5, 2, NULL, NULL, NULL, 0.3, NULL, 14, FALSE, NULL, NULL, FALSE, 4, NULL),
(115, 'Signals to devices or other applications', 'Kitchen-sink reference component for class "Interface service to other applications", type "signals to devices or other applications".', 'Interface service to other applications', 'signals to devices or other applications', 1, 3, NULL, NULL, NULL, 0.7, NULL, 15, FALSE, NULL, NULL, FALSE, 4, NULL),
-- Interface service from other applications (dataElements, readingReferences, writingReferences)
(116, 'Messages from other applications', 'Kitchen-sink reference component for class "Interface service from other applications", type "messages from other applications".', 'Interface service from other applications', 'messages from other applications', 2, 0, 0, NULL, NULL, 0.9, NULL, 16, FALSE, NULL, NULL, FALSE, 4, NULL),
(117, 'Batch records from other applications', 'Kitchen-sink reference component for class "Interface service from other applications", type "batch records from other applications".', 'Interface service from other applications', 'batch records from other applications', 3, 1, 1, NULL, NULL, 1.0, NULL, 17, FALSE, NULL, NULL, FALSE, 4, NULL),
(118, 'Signals from devices or other applications', 'Kitchen-sink reference component for class "Interface service from other applications", type "signals from devices or other applications".', 'Interface service from other applications', 'signals from devices or other applications', 4, 2, 2, NULL, NULL, 0.0, NULL, 18, FALSE, NULL, NULL, FALSE, 4, NULL),
-- Data storage service (dataElements only)
(119, 'Entities or classes', 'Kitchen-sink reference component for class "Data storage service", type "entities or classes". A real MLA-enabled example of this type is component 150 below.', 'Data storage service', 'entities or classes', 5, NULL, NULL, NULL, NULL, 0.1, NULL, 19, FALSE, NULL, NULL, FALSE, 4, NULL),
(120, 'Other record types', 'Kitchen-sink reference component for class "Data storage service", type "other record types".', 'Data storage service', 'other record types', 1, NULL, NULL, NULL, NULL, 0.3, NULL, 20, FALSE, NULL, NULL, FALSE, 4, NULL),
-- Algorithmic or manipulation service (dataElements, operations only)
(121, 'Security routines', 'Kitchen-sink reference component for class "Algorithmic or manipulation service", type "security routines".', 'Algorithmic or manipulation service', 'security routines', 2, NULL, NULL, NULL, 1, 0.7, NULL, 21, FALSE, NULL, NULL, FALSE, 4, NULL),
(122, 'Calculation routines', 'Kitchen-sink reference component for class "Algorithmic or manipulation service", type "calculation routines".', 'Algorithmic or manipulation service', 'calculation routines', 3, NULL, NULL, NULL, 2, 0.9, NULL, 22, FALSE, NULL, NULL, FALSE, 4, NULL),
(123, 'Simulation routines', 'Kitchen-sink reference component for class "Algorithmic or manipulation service", type "simulation routines".', 'Algorithmic or manipulation service', 'simulation routines', 4, NULL, NULL, NULL, 3, 1.0, NULL, 23, FALSE, NULL, NULL, FALSE, 4, NULL),
(124, 'Formatting routines', 'Kitchen-sink reference component for class "Algorithmic or manipulation service", type "formatting routines".', 'Algorithmic or manipulation service', 'formatting routines', 5, NULL, NULL, NULL, 4, 0.0, NULL, 24, FALSE, NULL, NULL, FALSE, 4, NULL),
(125, 'Database cleaning routines', 'Kitchen-sink reference component for class "Algorithmic or manipulation service", type "database cleaning routines".', 'Algorithmic or manipulation service', 'database cleaning routines', 1, NULL, NULL, NULL, 1, 0.1, NULL, 25, FALSE, NULL, NULL, FALSE, 4, NULL),
(126, 'Other manipulation routines', 'Kitchen-sink reference component for class "Algorithmic or manipulation service", type "other manipulation routines".', 'Algorithmic or manipulation service', 'other manipulation routines', 2, NULL, NULL, NULL, 2, 0.3, NULL, 26, FALSE, NULL, NULL, FALSE, 4, NULL),

-- MLA parent A: Interactive end-user input service / 2-functional.
-- dataElements=4, readingReferences=3, writingReferences=2 => calculateReferencesSum = 5,
-- used by the B-UI/UI-B sub-components below (mirrors fc-service-functions.ts createSubComponents).
(130, 'MLA input service (2-functional)', 'MLA-enabled component: enabling MLA generates the four sub-components below (rows 131-134).', 'Interactive end-user input service', '2-functional', 4, 3, 2, 2, NULL, 0.7, NULL, 27, TRUE, NULL, NULL, FALSE, 4, NULL),
(131, 'MLA input service (2-functional)-UI-B', NULL, 'Interface service to other applications', 'messages to other applications', 4, 1, NULL, 2, NULL, 0.7, NULL, 27, FALSE, 130, 'UI-B', TRUE, 4, NULL),
(132, 'MLA input service (2-functional)-UI-B', NULL, 'Interface service from other applications', 'messages from other applications', 4, 1, 1, 2, NULL, 0.7, NULL, 27, FALSE, 130, 'UI-B', TRUE, 4, NULL),
(133, 'MLA input service (2-functional)-B-UI', NULL, 'Interface service to other applications', 'messages to other applications', 4, 5, NULL, 2, NULL, 0.7, NULL, 27, FALSE, 130, 'B-UI', TRUE, 4, NULL),
(134, 'MLA input service (2-functional)-B-UI', NULL, 'Interface service from other applications', 'messages from other applications', 4, 1, 5, 2, NULL, 0.7, NULL, 27, FALSE, 130, 'B-UI', TRUE, 4, NULL),

-- MLA parent B: Interactive end-user navigation and query service / browsing lists (one of the
-- four MLA-eligible nav&query types - see mlaNavigationAndQueryComponentTypes).
-- dataElements=2, readingReferences=3, writingReferences=NULL => calculateReferencesSum = 3.
(140, 'MLA browsing lists', 'MLA-enabled component: enabling MLA generates the four sub-components below (rows 141-144).', 'Interactive end-user navigation and query service', 'browsing lists', 2, 3, NULL, NULL, NULL, 0.3, NULL, 28, TRUE, NULL, NULL, FALSE, 4, NULL),
(141, 'MLA browsing lists-UI-B', NULL, 'Interface service to other applications', 'messages to other applications', 2, 1, NULL, NULL, NULL, 0.3, NULL, 28, FALSE, 140, 'UI-B', TRUE, 4, NULL),
(142, 'MLA browsing lists-UI-B', NULL, 'Interface service from other applications', 'messages from other applications', 2, 1, 1, NULL, NULL, 0.3, NULL, 28, FALSE, 140, 'UI-B', TRUE, 4, NULL),
(143, 'MLA browsing lists-B-UI', NULL, 'Interface service to other applications', 'messages to other applications', 2, 3, NULL, NULL, NULL, 0.3, NULL, 28, FALSE, 140, 'B-UI', TRUE, 4, NULL),
(144, 'MLA browsing lists-B-UI', NULL, 'Interface service from other applications', 'messages from other applications', 2, 1, 3, NULL, NULL, 0.3, NULL, 28, FALSE, 140, 'B-UI', TRUE, 4, NULL),

-- MLA parent C: Data storage service / entities or classes. dataElements=5 propagates to all four
-- sub-components; reading/writing references on the B-D/D-B pairs are fixed, not derived.
(150, 'MLA entities or classes', 'MLA-enabled component: enabling MLA generates the four sub-components below (rows 151-154).', 'Data storage service', 'entities or classes', 5, NULL, NULL, NULL, NULL, 0.9, NULL, 29, TRUE, NULL, NULL, FALSE, 4, NULL),
(151, 'MLA entities or classes-B-D', NULL, 'Interface service to other applications', 'messages to other applications', 5, 2, NULL, NULL, NULL, 0.9, NULL, 29, FALSE, 150, 'B-D', TRUE, 4, NULL),
(152, 'MLA entities or classes-B-D', NULL, 'Interface service from other applications', 'messages from other applications', 5, 1, 1, NULL, NULL, 0.9, NULL, 29, FALSE, 150, 'B-D', TRUE, 4, NULL),
(153, 'MLA entities or classes-D-B', NULL, 'Interface service to other applications', 'messages to other applications', 5, 1, NULL, NULL, NULL, 0.9, NULL, 29, FALSE, 150, 'D-B', TRUE, 4, NULL),
(154, 'MLA entities or classes-D-B', NULL, 'Interface service from other applications', 'messages from other applications', 5, NULL, 1, NULL, NULL, 0.9, NULL, 29, FALSE, 150, 'D-B', TRUE, 4, NULL);

DO $$
DECLARE
    owner_username CONSTANT text := current_setting('kitchen_sink.owner_username');
    project_title  CONSTANT text := '[Kitchen sink] Every component type + MLA';
    owner_id       bigint;
    new_project_id bigint;
    component_count integer;
BEGIN
    SELECT id INTO owner_id
    FROM app_users
    WHERE LOWER(username) = LOWER(owner_username) AND deleted_at IS NULL;
    IF owner_id IS NULL THEN
        RAISE EXCEPTION 'No active user "%" found. Check the owner_username you passed.', owner_username;
    END IF;

    IF EXISTS (SELECT 1 FROM projects WHERE project_name = project_title AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'Project "%" already exists. Soft-delete it first to re-insert.', project_title;
    END IF;

    INSERT INTO projects (project_name, version, created_at, version_created_at, calculation_date,
                          report_contact_details, report_notes, updated_at, deleted_at)
    VALUES (project_title, 1, NOW(), NOW(), NULL,
            'Reference project - not a real benefit calculation.',
            'Contains one component per (class, type) combination plus three real MLA parents with generated sub-components. See file header comment in database-seed-dev.sql.',
            NOW(), NULL)
    RETURNING id INTO new_project_id;

    INSERT INTO projects_app_users (project_id, app_user_id) VALUES (new_project_id, owner_id);

    -- Old (seed) id -> new sequence id, handed out in seed id order.
    CREATE TEMP TABLE kitchen_sink_idmap ON COMMIT DROP AS
    SELECT s.id AS old_id,
           nextval(pg_get_serial_sequence('functional_components', 'id')) AS new_id
    FROM (SELECT id FROM kitchen_sink_stage ORDER BY id) s;

    INSERT INTO functional_components (
        id, title, description, class_name, component_type, data_elements, reading_references,
        writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
        order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
    )
    SELECT m.new_id, s.title, s.description, s.class_name, s.component_type, s.data_elements,
           s.reading_references, s.writing_references, s.functional_multiplier, s.operations,
           s.degree_of_completion, s.previous_fc_id, s.order_position, s.is_mla, pm.new_id,
           s.sub_component_type, s.is_readonly, new_project_id, s.deleted_at
    FROM kitchen_sink_stage s
    JOIN kitchen_sink_idmap m ON m.old_id = s.id
    LEFT JOIN kitchen_sink_idmap pm ON pm.old_id = s.parent_fc_id
    ORDER BY s.id;

    GET DIAGNOSTICS component_count = ROW_COUNT;
    RAISE NOTICE 'Inserted project % (owner "%", user id %) with % components.',
        new_project_id, owner_username, owner_id, component_count;
END
$$;

COMMIT;
