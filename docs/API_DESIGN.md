# API Design

## 1. RESTful Principles
- All endpoints are prefixed with `/api/v1`.
- JSON formatting for all requests and responses.
- Standard HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).

## 2. Authentication Endpoints
- `POST /api/v1/auth/login` - Authenticate user, return JWT.
- `POST /api/v1/auth/register` - Register a new user.
- `GET /api/v1/auth/me` - Get current user profile.

## 3. Project Management Endpoints
- `GET /api/v1/projects` - List all projects.
- `POST /api/v1/projects` - Create a new project.
- `GET /api/v1/projects/{id}` - Get project details.
- `PUT /api/v1/projects/{id}` - Update project details.
- `DELETE /api/v1/projects/{id}` - Soft delete a project.

## 4. DevOps Integrations Endpoints
### GitHub
- `GET /api/v1/projects/{id}/github/repos` - List connected repositories.
- `GET /api/v1/projects/{id}/github/commits` - List recent commits.

### Jenkins
- `POST /api/v1/projects/{id}/jenkins/build` - Trigger pipeline.
- `GET /api/v1/projects/{id}/jenkins/logs/{build_id}` - Get build logs.

### Docker
- `GET /api/v1/docker/containers` - List running containers.
- `POST /api/v1/docker/containers/{id}/restart` - Restart container.

### Kubernetes
- `GET /api/v1/kubernetes/pods` - List pods in a namespace.
- `POST /api/v1/kubernetes/deployments/{id}/scale` - Scale a deployment.

### Monitoring & Security
- `GET /api/v1/monitoring/metrics` - Fetch Prometheus metrics.
- `GET /api/v1/security/reports` - Fetch Trivy/SonarQube reports.
