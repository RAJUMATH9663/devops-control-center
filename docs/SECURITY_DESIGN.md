# Security Design

## 1. Authentication & Authorization
- **JWT (JSON Web Tokens)**: Used for stateless authentication. Tokens are signed with a strong secret key.
- **RBAC (Role-Based Access Control)**: Enforced at the API level (FastAPI Dependencies) and UI level. Roles include Admin, DevOps Engineer, and Developer.
- **Password Hashing**: Passwords are never stored in plaintext. `passlib` with `bcrypt` is used to hash passwords before storing them in PostgreSQL.

## 2. Secrets Management
- **HashiCorp Vault**: Used to securely store third-party credentials (e.g., GitHub OAuth tokens, AWS access keys, Kubeconfigs). The backend API retrieves these credentials on-the-fly and does not store them in the primary PostgreSQL database.

## 3. Network Security
- **TLS/SSL**: All external traffic must be encrypted over HTTPS.
- **CORS Configuration**: The FastAPI backend restricts Cross-Origin Resource Sharing to the specific domain of the frontend application.
- **VPC / Private Networking**: In production, the database and backend services are not exposed directly to the public internet. Only the Frontend UI (via Nginx or a Load Balancer) is exposed.

## 4. Application Security Scanning
- **SonarQube**: Integrated into the CI/CD pipelines to scan for code smells, bugs, and static analysis vulnerabilities.
- **Trivy**: Used to scan Docker container images for CVEs before pushing them to the registry or deploying to Kubernetes.
