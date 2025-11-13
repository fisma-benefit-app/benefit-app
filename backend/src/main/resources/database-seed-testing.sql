DELETE FROM  projects_app_users;
DELETE FROM  functional_components;
DELETE FROM  app_users;
DELETE FROM  projects;

INSERT INTO app_users (id, username, password, deleted_at)
VALUES  (1, 'user', '$2a$12$sB624Bv4kZ5yv6sWp8a28OfMIzUctymvXc1tqDd81lXl65lH3JlEa', NULL),
        (2, 'user2', '$2a$12$cDPmgp6oULhgNq7IVlPW7.wyhcRrdOMjzwTyTzfOby2vGBMY8Up3S', NULL),
        (3, 'user3', '$2a$12$dZh5J5oPpIBr2uJIerlnXO1R0eqORWewEBXfSdOXyago4zqIu45Za', NULL),
        (4, 'user4', '$2a$12$18jvhhlq5B3dwGIRQ.Zq4eAK2Jv4kzj./VqDpPjWythtyBTLXgKDeu', NULL),
        (5, 'user5', '$2a$12$.lOrDr3ySPpiGuIE/MYevu1xzrx.AkvIXLyqX1ayR9.NNurS102S.', NULL),
        (6, 'user6', '$2a$12$ewD2dPGAILd4GNnrubf3zOEyS8sM.y.Ka7IkIA7ZVvI/90kHnLSQu', NULL),
        (7, 'user7', '$2a$12$Q7GhdpbD0giJsF1vjL8kJ.maKBH070E.J9zUk3hFWRPVNPWqVzM/q', NULL),
        (8, 'user8', '$2a$12$GIuUozK5WIG4pBtkN1zh/u5/kxISY8fDZPs/Bv6NyON.rPa.QrUaK', NULL),
        (9, 'user9', '$2a$12$j1xMkHXLGgQZ7xh53u6jXu8awZ0BD39hx9p98TzydHkA52gG8mV3e', NULL),
        (10, 'user10', '$2a$12$2CzqvyUowvzC3CKax/bs1eyGdY6NZhZr7Z8/P2.RJCShbfFmwQD3a', NULL),
        (11, 'user11', '$2a$12$ia4ToODRIX5jpBxdpjGQh.aTUnhX8U2xYcsMGbnsibVNDHq0D/Z/e', NULL),
        (12, 'user12', '$2a$12$SH7Se/po3o3Jv.Vw9JHR9eGSOqc.7wlJVCqo87UGTswtp3T.2r5ra', NULL),
        (13, 'user13', '$2a$12$ngoWb72vbymkR/gldluOXuJuOR6KZIVEpnVa6CvsAQsQvcpusL3pO', NULL),
        (14, 'user14', '$2a$12$KbP1wkCHRe0NRNBtE8iNy.PO3OzUh96/Nhsr1AMVZxitEq6SPxArS', NULL),
        (15, 'user15', '$2a$12$spd/bnnnGRKy7ePn5wFjZe0UmeV.7t1y/uxTreCXJN28xJ9hwgrxa', NULL),
        (16, 'user16', '$2a$12$AQ1dbe8sWFr1EjsXlRyfzu.I8pziNBpQU5l1xEV/ytaD08DkbLngy', NULL),
        (17, 'user17', '$2a$12$ILKi4LbcStENc0Mj6/VAB.vA6cz6o0HkZu7LXIUKSq1H/37DIkOA2', NULL),
        (18, 'user18', '$2a$12$/kZJpjsiaCrdoRHoKp/vf.4FcJcKJkLi57eye0WakMN6VTx/SWfbS', NULL),
        (19, 'user19', '$2a$12$hO1hs4VooRyMRvmI/dllceB2xVIBTRt1ShnR0uezVLkZEXfUaWgXK', NULL),
        (20, 'user20', '$2a$12$EYD5tJoTXdU3bX9c1LfQDO6Apd.Wg7IIk7pSVYgLxe6MybDyw72pi', NULL),
        (21, 'user21', '$2a$12$T2U.4Ib48hCmr3m/GlCqluSTXqohR/d1Bg95/o4AowDROaTExUFM2', NULL),
        (22, 'user22', '$2a$12$iG/aSJfNSpG55acXogEn9.odgnH6cE0RjZv0kPeKA3zFxMwDRsa4q', NULL),
        (23, 'user23', '$2a$12$vr5KOkNcbiVa7iHo43mY0O/M6KRGql.Pcjn5d/iQQHQjz3s3JKMSK', NULL),
        (24, 'user24', '$2a$12$QYttBVspA/4JGozdlhlnj.iqI4hq64TV/wJXBHvASA7CnUjU8hW52', NULL),
        (25, 'user25', '$2a$12$hhhBrl0eYVC6tcynXZsAA.gmdM58ChMN.R8CpuYqxDA.f2baBN9Yu', NULL),
        (26, 'user26', '$2a$12$HRM3S65upZx3XGyKBuPJXeogdUo2M0.EOHMyLIWsg9Jq2eC.tNhqa', NULL),
        (27, 'user27', '$2a$12$JhNtpJZWo7A9mkHzo/fZCuBm6aeb1lxmFlvsjDYxDAARvz8ghemCm', NULL),
        (28, 'user28', '$2a$12$dKIs3JVSPnfRrW8tufisa.ZRBootzNcLKKcli2DUV3QS.0BcoJ2cG', NULL),
        (29, 'user29', '$2a$12$GbwTUjzV/l7sKRbc7LxGNO0C52tfHGNagcWT8i8ONtPqngd/azuzK', NULL),
        (30, 'user30', '$2a$12$Ztsxy6EBe7lZO6ed/62jDOEPAOAV/446.Qhc2fT45Fva8iR22uoxa', NULL),
        (31, 'jukka', '$2a$12$ui8sZNb3Hoh24Y47c6Gq9O3lFXJ4RkIC6hasyOC/ukAo2eNRnjnba', NULL),
        (32, 'heikki', '$2a$12$Ib8Tx0LU/CiPkhmzQGftwOLbPD56T9Qc5l.hAVxxeDD137YIPcJ6.', NULL),
        (33, 'altti', '$2a$12$WGI/l1.6L5WogJaPl13mgOF7FoZoA4IwmqFTpyVbHp7q93nSF6MKC', NULL);

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