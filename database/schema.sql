-- ==========================================================
-- DevOps Control Center - PostgreSQL Database Schema DDL
-- ==========================================================

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS ix_roles_id ON roles(id);
CREATE INDEX IF NOT EXISTS ix_roles_name ON roles(name);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 3. Projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_projects_id ON projects(id);
CREATE INDEX IF NOT EXISTS ix_projects_name ON projects(name);

-- 4. Repositories
CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    github_repo_url VARCHAR(512) NOT NULL,
    default_branch VARCHAR(100) NOT NULL DEFAULT 'main'
);

CREATE INDEX IF NOT EXISTS ix_repositories_id ON repositories(id);

-- 5. Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    jenkins_job_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'idle'
);

CREATE INDEX IF NOT EXISTS ix_pipelines_id ON pipelines(id);

-- 6. Deployments
CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    environment VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    triggered_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS ix_deployments_id ON deployments(id);

-- 7. Clusters
CREATE TABLE IF NOT EXISTS clusters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    kubeconfig_ref VARCHAR(255),
    provider VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS ix_clusters_id ON clusters(id);
CREATE INDEX IF NOT EXISTS ix_clusters_name ON clusters(name);

-- 8. Namespaces
CREATE TABLE IF NOT EXISTS namespaces (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_namespaces_id ON namespaces(id);

-- 9. Servers
CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    ansible_group VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS ix_servers_id ON servers(id);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_id ON audit_logs(id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id ON audit_logs(user_id);

-- 11. Settings
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS ix_settings_id ON settings(id);
CREATE INDEX IF NOT EXISTS ix_settings_key ON settings(key);
