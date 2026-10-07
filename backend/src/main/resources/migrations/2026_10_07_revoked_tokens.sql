--Revoked tokens are stored in the database instead of in-memory-map,
--so that restarting backend doesnt reactivate logged-out tokens.

BEGIN;

CREATE TABLE IF NOT EXISTS revoked_tokens
    (
        jti VARCHAR PRIMARY KEY,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

COMMIT;