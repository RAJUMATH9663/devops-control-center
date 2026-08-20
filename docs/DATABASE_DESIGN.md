# Database Design

## 1. Technology Choice
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic

## 2. Core Entities & Relationships

### Users & Roles
- **users**: `id`, `email`, `hashed_password`, `full_name`, `role_id`, `is_active`, `created_at`, `updated_at`, `deleted_at`
- **roles**: `id`, `name` (Admin, Developer, DevOps), `permissions` (JSONB)

### Projects & Repositories
- **projects**: `id`, `name`, `description`, `owner_id` (FK users), `created_at`
- **repositories**: `id`, `project_id` (FK projects), `github_repo_url`, `default_branch`

### CI/CD & Deployments
- **pipelines**: `id`, `project_id`, `jenkins_job_name`, `status`
- **deployments**: `id`, `project_id`, `environment` (dev/staging/prod), `status`, `triggered_by` (FK users), `timestamp`

### Infrastructure
- **clusters**: `id`, `name`, `kubeconfig_ref`, `provider`
- **namespaces**: `id`, `cluster_id`, `name`
- **servers**: `id`, `hostname`, `ip_address`, `ansible_group`

### Audit & Settings
- **audit_logs**: `id`, `user_id`, `action`, `resource`, `details` (JSONB), `timestamp`
- **settings**: `id`, `key`, `value`, `is_encrypted`

## 3. Best Practices Implemented
- **Audit Columns**: Every table includes `created_at` and `updated_at`.
- **Soft Delete**: `deleted_at` column used instead of hard drops for critical entities (Users, Projects).
- **Foreign Keys**: Strict relational integrity with `ON DELETE CASCADE` where appropriate (e.g., deleting a project deletes its repositories).
- **Indexes**: Applied to heavily queried columns (e.g., `user_id`, `project_id`, `status`).
