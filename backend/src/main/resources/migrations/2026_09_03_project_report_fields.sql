ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS report_contact_details VARCHAR(2000);

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS report_notes VARCHAR(5000);