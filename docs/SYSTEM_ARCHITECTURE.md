# System Architecture

## 1. High-Level Architecture
The DevOps Control Center is designed as a modern, decoupled web application following a client-server architecture, containerized and orchestrated via Kubernetes.

### 1.1 Components
- **Frontend (Client)**: React (Vite) Single Page Application (SPA) using TypeScript, TailwindCSS, and Shadcn UI. Communicates with the backend via RESTful APIs.
- **Backend (API Server)**: Python FastAPI application handling business logic, integrations, and database interactions.
- **Database**: PostgreSQL for persistent structured data (Users, Projects, Audit Logs).
- **Cache / Message Broker**: (Optional/Future) Redis for caching GitHub API responses and background task queues.
- **DevOps Integrations Layer**:
  - Uses native SDKs or REST APIs to communicate with Jenkins, Docker, Kubernetes, Terraform, Ansible, Prometheus, SonarQube, and Vault.

## 2. Deployment Architecture
- **Environment**: Kubernetes Cluster.
- **Ingress**: Nginx Ingress Controller routing traffic to `/api` (Backend) and `/` (Frontend).
- **Backend**: Deployed as a Deployment with multiple replicas.
- **Frontend**: Served via Nginx containers.
- **Database**: StatefulSet with Persistent Volumes or a managed service (e.g., AWS RDS).

## 3. Security & Logging Architecture
- **Security**: JWT tokens for stateless authentication. Passwords hashed. Integration credentials encrypted and stored in Vault.
- **Logging**: Python `logging` module outputting JSON. Ingested by Loki for centralized log management.
- **Monitoring**: Backend exposes `/metrics` (Prometheus format) for API performance monitoring.
