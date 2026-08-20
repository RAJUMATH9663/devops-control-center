-- ==========================================================
-- DevOps Control Center - Database Initial Seed Data
-- ==========================================================

-- 1. Insert Default Roles
INSERT INTO roles (id, name, permissions) VALUES 
(1, 'Admin', '{"all": true, "manage_users": true, "manage_projects": true, "execute_deployments": true, "manage_infrastructure": true, "view_audit_logs": true}'::jsonb),
(2, 'DevOps', '{"manage_projects": true, "execute_deployments": true, "manage_infrastructure": true, "view_audit_logs": true, "view_metrics": true}'::jsonb),
(3, 'Developer', '{"view_projects": true, "trigger_pipelines": true, "view_logs": true, "view_metrics": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    permissions = EXCLUDED.permissions;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. Insert Default Admin User
-- Password is 'adminpassword123'
INSERT INTO users (id, email, hashed_password, full_name, is_active, role_id, created_at, updated_at) VALUES 
(1, 'admin@devops.io', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'System Administrator', TRUE, 1, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT (email) DO NOTHING;

-- Insert a Demo DevOps User
INSERT INTO users (id, email, hashed_password, full_name, is_active, role_id, created_at, updated_at) VALUES 
(2, 'devops@devops.io', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'DevOps Lead', TRUE, 2, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT (email) DO NOTHING;

-- Insert a Demo Developer User
INSERT INTO users (id, email, hashed_password, full_name, is_active, role_id, created_at, updated_at) VALUES 
(3, 'developer@devops.io', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Frontend Developer', TRUE, 3, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Insert Initial Settings
INSERT INTO settings (key, value, is_encrypted) VALUES 
('system.theme', 'dark', FALSE),
('system.notifications_enabled', 'true', FALSE),
('security.session_timeout_minutes', '10080', FALSE),
('integrations.github.enabled', 'true', FALSE),
('integrations.jenkins.enabled', 'true', FALSE),
('integrations.kubernetes.enabled', 'true', FALSE),
('integrations.docker.enabled', 'true', FALSE),
('integrations.monitoring.prometheus_url', 'http://prometheus:9090', FALSE)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Insert Initial Clusters
INSERT INTO clusters (id, name, kubeconfig_ref, provider) VALUES 
(1, 'prod-cluster-us-east', 'vault://secret/k8s/prod-cluster', 'AWS EKS'),
(2, 'staging-cluster-eu-west', 'vault://secret/k8s/staging-cluster', 'GCP GKE'),
(3, 'local-dev-cluster', 'local://~/.kube/config', 'Minikube')
ON CONFLICT (id) DO NOTHING;

SELECT setval('clusters_id_seq', (SELECT MAX(id) FROM clusters));

-- 5. Insert Namespaces
INSERT INTO namespaces (cluster_id, name) VALUES 
(1, 'production'),
(1, 'monitoring'),
(1, 'ingress-nginx'),
(2, 'staging'),
(2, 'qa'),
(3, 'default')
ON CONFLICT DO NOTHING;

-- 6. Insert Initial Servers
INSERT INTO servers (hostname, ip_address, ansible_group) VALUES 
('web-prod-01.infra.internal', '10.0.1.101', 'webservers'),
('web-prod-02.infra.internal', '10.0.1.102', 'webservers'),
('db-primary.infra.internal', '10.0.2.201', 'databases'),
('worker-01.infra.internal', '10.0.3.301', 'workers')
ON CONFLICT DO NOTHING;

-- 7. Insert Initial Demo Project & Pipeline
INSERT INTO projects (id, name, description, owner_id, created_at, updated_at) VALUES 
(1, 'DevOps Control Center Core', 'Main microservices and dashboard management repository', 1, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

INSERT INTO repositories (project_id, github_repo_url, default_branch) VALUES 
(1, 'https://github.com/acme-corp/devops-control-center', 'main')
ON CONFLICT DO NOTHING;

INSERT INTO pipelines (id, project_id, jenkins_job_name, status) VALUES 
(1, 1, 'backend-core-pipeline', 'success')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pipelines_id_seq', (SELECT MAX(id) FROM pipelines));

INSERT INTO deployments (pipeline_id, environment, status, triggered_by, timestamp) VALUES 
(1, 'production', 'success', 1, NOW() AT TIME ZONE 'UTC')
ON CONFLICT DO NOTHING;
