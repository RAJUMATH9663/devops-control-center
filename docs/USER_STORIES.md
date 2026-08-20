# User Stories

## Admin
1. **As an Admin**, I want to manage user roles and permissions so that I can control who has access to specific parts of the platform.
2. **As an Admin**, I want to configure global integrations (e.g., GitHub OAuth, Jenkins URL, Docker Registry) so that all projects can utilize them.
3. **As an Admin**, I want to view platform-wide metrics (CPU, RAM, Disk usage) so that I can ensure the infrastructure is healthy.
4. **As an Admin**, I want to review audit logs of all user actions so that I can maintain security and compliance.

## DevOps Engineer
1. **As a DevOps Engineer**, I want to manage Kubernetes clusters and namespaces from the dashboard so that I don't have to switch to `kubectl`.
2. **As a DevOps Engineer**, I want to execute Terraform scripts to provision infrastructure directly from the UI.
3. **As a DevOps Engineer**, I want to run Ansible playbooks against a dynamic inventory to configure servers automatically.
4. **As a DevOps Engineer**, I want to view detailed Prometheus metrics and Grafana dashboards for specific microservices.
5. **As a DevOps Engineer**, I want to configure CI/CD pipeline templates that developers can use.

## Developer
1. **As a Developer**, I want to create a new project and link it to a GitHub repository so that I can track its lifecycle.
2. **As a Developer**, I want to view the status of my recent commits and pull requests within the dashboard.
3. **As a Developer**, I want to trigger a Jenkins build manually if a webhook fails to fire.
4. **As a Developer**, I want to view live logs of my deployed pods in Kubernetes to debug issues quickly.
5. **As a Developer**, I want to see SonarQube and Trivy security scans for my project so I can fix vulnerabilities before deployment.
