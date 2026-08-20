# Use Cases

## 1. Project Onboarding
**Actor**: Developer
**Precondition**: User is logged in.
**Steps**:
1. Developer navigates to "Projects" and clicks "Create Project".
2. Developer enters project name and description.
3. Developer links a GitHub repository via OAuth.
4. System fetches repository details and creates a default Jenkins pipeline configuration.
5. System displays the new project on the Dashboard.

## 2. Infrastructure Provisioning
**Actor**: DevOps Engineer
**Precondition**: User has DevOps Engineer role.
**Steps**:
1. Engineer navigates to "Infrastructure -> Terraform".
2. Engineer selects a Terraform workspace (e.g., AWS EKS Cluster).
3. Engineer clicks "Plan". System streams Terraform plan logs to the UI.
4. Engineer reviews the plan and clicks "Apply".
5. System updates the status to "Provisioning" and streams the apply logs.
6. Upon success, new infrastructure resources are registered in the system.

## 3. Incident Investigation
**Actor**: Developer / DevOps Engineer
**Precondition**: An alert is triggered.
**Steps**:
1. User receives a notification (Slack/Email) about a high CPU usage alert.
2. User clicks the link to open the DevOps Control Center.
3. User navigates to the "Monitoring" tab and views the Grafana chart for the affected pod.
4. User switches to the "Logs" tab to search Loki for error messages in the pod.
5. User identifies the issue and restarts the pod directly from the "Kubernetes" view.

## 4. Security Auditing
**Actor**: Admin
**Precondition**: Admin role.
**Steps**:
1. Admin navigates to the "Reports" section.
2. Admin generates a "Security Report".
3. System compiles data from Trivy (container scans) and SonarQube (code quality).
4. Admin exports the report as a PDF for compliance meetings.
