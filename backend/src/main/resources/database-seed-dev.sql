
-- This file is used to seed the database with initial data for development purposes. It is not used by production nor testing environments.
-- Please refer to the schema-dev.sql file for the database schema definition.
--
-- This file is safe to re-run: every table it inserts into is cleared first (children before
-- parents, to respect foreign keys), so reseeding a running dev database just replaces everything.
--
-- Rather than one giant "worst case" project, data is split into several small, single-purpose
-- projects. A monster project that mixes every scenario together makes it hard to tell, when
-- something looks wrong, which scenario actually broke it. Each project below documents the one
-- thing it exists to exercise:
--
--   1 - project-x                                    baseline smoke-test project (small, everyday data)
--   2 - [Edge case] Empty project                     zero components: empty-state UI
--   3 - [Edge case] Soft-deleted project               project + components with deleted_at set
--   4 - [Kitchen sink] Every component type + MLA      one component per (class, type) combo, plus
--                                                       real MLA parents with generated sub-components
--   5 - [Scale] 300-component stress test              flat, bulk-generated: list rendering, drag/
--                                                       reorder, PDF/CSV export performance
--   6/7 - [Versioning] Benefit calculation history      two versions of "the same" project, to exercise
--                                                       the version diff/report (added/changed/removed/
--                                                       unchanged components)
--   8 - [Sharing] Shared with the whole team            every user attached, incl. a soft-deleted user,
--                                                       plus several comments (one at the 2000-char cap)
--   9 - [Edge case] Field length boundaries             project name / contact / notes / title /
--                                                       description each at their exact DB/DTO max length
--
-- MLA sub-component values in project 4 are not arbitrary: they mirror the exact shapes produced by
-- createSubComponents()/updateSubComponents() in frontend/src/lib/fc-service-functions.ts (which
-- reading/writing reference each sub-component type gets, and which fields get reset to NULL per
-- class per frontend/src/lib/fc-constants.ts's componentParameterResetMap). Seed data that doesn't
-- follow those rules can hide bugs in the exact area that broke in #704-#707.

DELETE FROM comments;
DELETE FROM projects_app_users;
DELETE FROM functional_components;
DELETE FROM projects;
DELETE FROM app_users;

INSERT INTO app_users (id, username, password, deleted_at)
VALUES  (1, 'user', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue', NULL),
        (2, 'user2', '$2a$12$4JuHucPwX0CfxAeRD87I/OMrD8SndXaptn3Yp2MJeOiLklIbJ3XjW', NULL),
        (3, 'user3', '$2a$12$tJY5QjbeRPU4HN0hGV48HOu2tIV9dMVCqyqJxNOtjsuNQCbNkUeza', NULL),
        (4, 'user4', '$2a$12$RTbuJ9r1PLJxd.anzqEzGuxNMlnRe0DylL0v6fgrzNzCTEVDzz1ci', NULL),
        (5, 'user5', '$2a$12$kHh09CQz9p0RLGMXnBkyS.fueTfRcOqI9Q2MvI8eyNcDjiC7a5Ada', NULL),
        (6, 'jukka', '$2a$12$HalfqF43RCkPeRRJ7EkQMOjWcjDqLZ4udbTC6DYZRR7C6P0kRpoCm', NULL),
        (7, 'heikki', '$2a$12$VvPmVx1yxpPVHAEerqvO1.Pmsp96pxLlsw622r9Zun5r0X9NIuNhy', NULL),
        (8, 'altti', '$2a$12$UVmCG.ySaTe6rWo4X5G2yOFpMuu.Mo89GbmmxJzJOUHpnKUAcXfJ.', NULL),
        -- Soft-deleted user, still referenced by project 8's projects_app_users below, to verify
        -- the UI/API handle a project shared with a since-deleted member gracefully.
        (9, 'poistunut-kayttaja', '$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue', NOW() - INTERVAL '10 days');

INSERT INTO projects (id, project_name, version, created_at, version_created_at, calculation_date, report_contact_details, report_notes, updated_at, deleted_at)
VALUES  -- 1: baseline smoke-test project
        (1, 'project-x', 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NULL, NULL, NULL, NOW() - INTERVAL '1 days', NULL),

        -- 2: empty project (zero components)
        (2, '[Edge case] Empty project', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL, NULL, NULL, NOW() - INTERVAL '5 days', NULL),

        -- 3: soft-deleted project (see matching functional_components deleted_at below)
        (3, '[Edge case] Soft-deleted project', 1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NULL, NULL, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

        -- 4: kitchen sink - every component type + MLA
        (4, '[Kitchen sink] Every component type + MLA', 1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NULL, 'Reference project - not a real benefit calculation.', 'Contains one component per (class, type) combination plus three real MLA parents with generated sub-components. See file header comment in database-seed-dev.sql.', NOW() - INTERVAL '1 days', NULL),

        -- 5: scale / stress test (components generated further below)
        (5, '[Scale] 300-component stress test', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NOW() - INTERVAL '2 days', NULL),

        -- 6/7: two versions of the same project, for testing the version diff/report
        (6, '[Versioning] Benefit calculation history', 1, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NULL, NULL, NULL, NOW() - INTERVAL '40 days', NULL),
        (7, '[Versioning] Benefit calculation history', 2, NOW() - INTERVAL '40 days', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NOW() - INTERVAL '2 days', NULL),

        -- 8: shared with the whole team
        (8, '[Sharing] Shared with the whole team', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NOW() - INTERVAL '1 days', NULL),

        -- 9: field length boundaries (project_name itself is padded to exactly 255 chars)
        (9, LEFT('[Edge case] Max-length project name (255 chars) - ' || REPEAT('0123456789', 30), 255), 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL,
         LEFT('[Edge case] Max-length report contact details (2000 chars). ' || REPEAT('Contact info line. ', 200), 2000),
         LEFT('[Edge case] Max-length report notes (5000 chars). ' || REPEAT('Note about scope, assumptions and calculation rationale. ', 300), 5000),
         NOW() - INTERVAL '3 days', NULL);

-- ===========================================================================================
-- Project 1: project-x - baseline smoke-test data (unchanged in spirit from the original seed)
-- ===========================================================================================
INSERT INTO functional_components (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
VALUES  (1, 'Hakijan syöte', 'Kenttä hakijan syötteelle', 'Interactive end-user input service', '1-functional', 2, 4, 2, 1, NULL, 0.12, NULL, 0, FALSE, NULL, NULL, FALSE, 1, NULL),
        (2, 'Lukumäärän valintapainike', 'Valintapainike lukumäärälle', 'Interactive end-user input service', '2-functional', 2, 4, 2, 2, NULL, 0.34, NULL, 1, FALSE, NULL, NULL, FALSE, 1, NULL),
        (3, 'Lähetä-painike', 'Painikkeella käyttäjä lähettää tiedot', 'Interactive end-user input service', '1-functional', 2, 4, 2, 1, NULL, 0.5, NULL, 2, FALSE, NULL, NULL, FALSE, 1, NULL);

-- Project 2 (empty project) intentionally has no functional_components rows.

-- ===========================================================================================
-- Project 3: soft-deleted project - project and every one of its components share deleted_at,
-- matching exactly what ProjectService.deleteProject() does (cascading soft delete).
-- ===========================================================================================
INSERT INTO functional_components (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
VALUES  (10, 'Poistettu komponentti 1', 'Tämä komponentti kuuluu poistettuun projektiin', 'Data storage service', 'entities or classes', 3, NULL, NULL, NULL, NULL, 0.5, NULL, 0, FALSE, NULL, NULL, FALSE, 3, NOW() - INTERVAL '2 days'),
        (11, 'Poistettu komponentti 2', 'Myös tämä on poistettu projektin mukana', 'Non-interactive end-user output service', 'forms', 2, 1, NULL, NULL, NULL, 0.9, NULL, 1, FALSE, NULL, NULL, FALSE, 3, NOW() - INTERVAL '2 days');

-- ===========================================================================================
-- Project 4: kitchen sink - one component per (class_name, component_type) combination.
-- Values respect which fields each class actually uses (frontend/src/lib/fc-constants.ts
-- componentClassFields / componentParameterResetMap): unused fields are NULL, not zero, so the
-- data matches what the real app would ever save.
-- ===========================================================================================
INSERT INTO functional_components (
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

-- ===========================================================================================
-- Project 5: 300-component scale/stress test, generated instead of hand-written so it's
-- actually maintainable. Cycles through the same 27 (class, type) combinations as the kitchen
-- sink, applying the same per-class NULL rules, across order_position 0..299.
-- ===========================================================================================
WITH combos(idx, class_name, component_type) AS (
    VALUES  (0, 'Interactive end-user navigation and query service', 'function designators'),
            (1, 'Interactive end-user navigation and query service', 'log-in log-out functions'),
            (2, 'Interactive end-user navigation and query service', 'function lists'),
            (3, 'Interactive end-user navigation and query service', 'selection lists'),
            (4, 'Interactive end-user navigation and query service', 'data inquiries'),
            (5, 'Interactive end-user navigation and query service', 'generation indicators'),
            (6, 'Interactive end-user navigation and query service', 'browsing lists'),
            (7, 'Interactive end-user input service', '1-functional'),
            (8, 'Interactive end-user input service', '2-functional'),
            (9, 'Interactive end-user input service', '3-functional'),
            (10, 'Non-interactive end-user output service', 'forms'),
            (11, 'Non-interactive end-user output service', 'emails for text messages'),
            (12, 'Non-interactive end-user output service', 'monitor screens'),
            (13, 'Interface service to other applications', 'messages to other applications'),
            (14, 'Interface service to other applications', 'batch records to other applications'),
            (15, 'Interface service to other applications', 'signals to devices or other applications'),
            (16, 'Interface service from other applications', 'messages from other applications'),
            (17, 'Interface service from other applications', 'batch records from other applications'),
            (18, 'Interface service from other applications', 'signals from devices or other applications'),
            (19, 'Data storage service', 'entities or classes'),
            (20, 'Data storage service', 'other record types'),
            (21, 'Algorithmic or manipulation service', 'security routines'),
            (22, 'Algorithmic or manipulation service', 'calculation routines'),
            (23, 'Algorithmic or manipulation service', 'simulation routines'),
            (24, 'Algorithmic or manipulation service', 'formatting routines'),
            (25, 'Algorithmic or manipulation service', 'database cleaning routines'),
            (26, 'Algorithmic or manipulation service', 'other manipulation routines')
),
completion(idx, value) AS (
    VALUES (0, 0.0), (1, 0.1), (2, 0.3), (3, 0.7), (4, 0.9), (5, 1.0)
)
INSERT INTO functional_components (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
SELECT
    9000 + n,
    'Stress component ' || LPAD(n::text, 4, '0'),
    'Auto-generated flat component for large-project performance testing (list rendering, drag-and-drop reorder, PDF/CSV export).',
    c.class_name,
    c.component_type,
    (n % 6),
    CASE WHEN c.class_name IN ('Data storage service', 'Algorithmic or manipulation service') THEN NULL ELSE (n % 4) END,
    CASE WHEN c.class_name IN ('Interactive end-user input service', 'Interface service from other applications') THEN (n % 3) ELSE NULL END,
    CASE WHEN c.class_name = 'Interactive end-user input service' THEN SPLIT_PART(c.component_type, '-', 1)::int ELSE NULL END,
    CASE WHEN c.class_name = 'Algorithmic or manipulation service' THEN (n % 5) ELSE NULL END,
    comp.value,
    NULL,
    n - 1,
    FALSE,
    NULL,
    NULL,
    FALSE,
    5,
    NULL
FROM generate_series(1, 300) AS n
JOIN combos c ON c.idx = (n - 1) % 27
JOIN completion comp ON comp.idx = (n - 1) % 6;

-- ===========================================================================================
-- Projects 6/7: two versions of "the same" project. Component 210 carries over from 200 with
-- changed values (scope grew), 211 carries over from 201 unchanged, 202 is dropped in v2
-- (removed), and 212 is new in v2 (added). Covers all four diff states a version/PDF report
-- needs to render. previousFCId links new-version rows to their old-version counterpart, exactly
-- as ProjectService.createProjectVersion() does - never to a sibling in the same project.
-- ===========================================================================================
INSERT INTO functional_components (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
VALUES  -- v1 (project 6)
        (200, 'Hakulomake', 'Hakijan perustietojen syöttölomake', 'Interactive end-user input service', '1-functional', 3, 1, 2, 1, NULL, 0.3, NULL, 0, FALSE, NULL, NULL, FALSE, 6, NULL),
        (201, 'Hakemus-taulu', 'Hakemustietojen tallennusrakenne', 'Data storage service', 'entities or classes', 4, NULL, NULL, NULL, NULL, 0.7, NULL, 1, FALSE, NULL, NULL, FALSE, 6, NULL),
        (202, 'Pisteytyslaskenta', 'Hakemuksen pisteiden laskentasääntö - poistetaan versiossa 2', 'Algorithmic or manipulation service', 'calculation routines', 2, NULL, NULL, NULL, 3, 0.3, NULL, 2, FALSE, NULL, NULL, FALSE, 6, NULL),
        -- v2 (project 7)
        (210, 'Hakulomake', 'Hakijan perustietojen syöttölomake, laajennettu lisäkentillä', 'Interactive end-user input service', '1-functional', 3, 1, 3, 1, NULL, 0.9, 200, 0, FALSE, NULL, NULL, FALSE, 7, NULL),
        (211, 'Hakemus-taulu', 'Hakemustietojen tallennusrakenne', 'Data storage service', 'entities or classes', 4, NULL, NULL, NULL, NULL, 0.7, 201, 1, FALSE, NULL, NULL, FALSE, 7, NULL),
        (212, 'Yhteenvetoraportti', 'Uusi versiossa 2: yhteenveto käsitellyistä hakemuksista', 'Non-interactive end-user output service', 'forms', 3, 2, NULL, NULL, NULL, 0.1, NULL, 2, FALSE, NULL, NULL, FALSE, 7, NULL);

-- ===========================================================================================
-- Project 8: shared with the whole team, incl. the soft-deleted user (id 9) as a member.
-- ===========================================================================================
INSERT INTO functional_components (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
VALUES  (300, 'Kirjautuminen', 'Käyttäjän kirjautumistoiminto', 'Interactive end-user navigation and query service', 'log-in log-out functions', 2, 1, NULL, NULL, NULL, 1.0, NULL, 0, FALSE, NULL, NULL, FALSE, 8, NULL),
        (301, 'Ilmoitusviesti', 'Ulkoiselle järjestelmälle lähetettävä ilmoitus', 'Interface service to other applications', 'messages to other applications', 2, 1, NULL, NULL, NULL, 0.7, NULL, 1, FALSE, NULL, NULL, FALSE, 8, NULL);

-- ===========================================================================================
-- Project 9: field length boundaries. Project-level fields are padded to their exact DTO/entity
-- max length in the projects INSERT above; component-level fields are padded here.
-- ===========================================================================================
INSERT INTO functional_components (
    id, title, description, class_name, component_type, data_elements, reading_references,
    writing_references, functional_multiplier, operations, degree_of_completion, previous_fc_id,
    order_position, is_mla, parent_fc_id, sub_component_type, is_readonly, project_id, deleted_at
)
VALUES  (400,
         LEFT('Max-length title (255 chars) - ' || REPEAT('0123456789', 30), 255),
         'Component title is padded to exactly 255 characters, the @Size limit on FunctionalComponent.title.',
         'Non-interactive end-user output service', 'forms', 1, 1, NULL, NULL, NULL, 0.5, NULL, 0, FALSE, NULL, NULL, FALSE, 9, NULL),
        (401,
         'Max-length description',
         LEFT('Component description is padded to exactly 10000 characters, the @Size limit raised in migration 2026_09_23 (see fa36d95). ' || REPEAT('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ', 200), 10000),
         'Algorithmic or manipulation service', 'calculation routines', 2, NULL, NULL, NULL, 1, 0.5, NULL, 1, FALSE, NULL, NULL, FALSE, 9, NULL);

INSERT INTO projects_app_users (id, project_id, app_user_id)
VALUES  (1, 1, 1),
        (2, 2, 1),
        (3, 3, 1),
        (4, 4, 1),
        (5, 4, 6),
        (6, 5, 1),
        (7, 6, 1),
        (8, 7, 1),
        (9, 8, 1),
        (10, 8, 2),
        (11, 8, 3),
        (12, 8, 4),
        (13, 8, 5),
        (14, 8, 6),
        (15, 8, 7),
        (16, 8, 8),
        (17, 8, 9),
        (18, 9, 1);

INSERT INTO comments (id, text, project_id)
VALUES  (1, 'This is a comment for project-x', 1),
        (2, 'Reference project - see file header comment in database-seed-dev.sql for what each component in here is for.', 4),
        (3, 'Muistetaan käydä läpi jäljellä olevat hakemukset ennen viikon loppua.', 8),
        (4, 'Kiitos päivityksestä, tarkistan laskennan vielä huomenna.', 8),
        (5, 'Lisätty uusi rajapintakomponentti - kommentoikaa jos jotain puuttuu.', 8),
        (6, 'poistunut-kayttaja oli tämän projektin jäsen ennen tilin poistoa.', 8),
        (7, LEFT('Max-length comment (2000 chars). ' || REPEAT('This comment exists to test rendering, scrolling and wrapping of a comment at the exact database/DTO limit. ', 40), 2000), 8);

SELECT setval('app_users_id_seq', (SELECT MAX(id) FROM app_users));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('functional_components_id_seq', (SELECT MAX(id) FROM functional_components));
SELECT setval('projects_app_users_id_seq', (SELECT MAX(id) FROM projects_app_users));
SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));
