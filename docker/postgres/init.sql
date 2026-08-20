-- ==========================================================
-- PostgreSQL Initialization Script
-- Executed on container startup by /docker-entrypoint-initdb.d
-- ==========================================================

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: SQLAlchemy and Alembic handle table creation,
-- or database/schema.sql & database/seed.sql can be executed here.
