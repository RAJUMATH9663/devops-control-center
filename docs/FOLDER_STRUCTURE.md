# Folder Structure

The project follows a modular, monorepo-style structure to keep all related configurations and codebases unified.

```
devops-control-center/
├── .github/
│   └── workflows/          # CI/CD pipelines for the platform itself
├── ansible/                # Ansible playbooks and inventories
├── backend/                # FastAPI Python Application
│   ├── app/
│   │   ├── api/            # API Routers and Endpoints
│   │   ├── core/           # Config, Security, DB session
│   │   ├── models/         # SQLAlchemy ORM Models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Business logic and external API integrations
│   │   └── main.py         # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
├── database/               # Alembic migrations and seed scripts
├── docker/                 # Docker Compose configurations
├── docs/                   # Architectural and project documentation
├── frontend/               # React Vite Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Shadcn)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Dashboard, Projects, Settings pages
│   │   ├── services/       # Axios API clients
│   │   └── store/          # Global state management
│   ├── package.json
│   └── Dockerfile
├── kubernetes/             # K8s Manifests (Deployments, Services, Ingress)
├── monitoring/             # Prometheus, Grafana, Loki configs
├── scripts/                # Bash/PowerShell setup and utility scripts
├── security/               # SonarQube, Trivy, Vault configurations
├── terraform/              # Terraform modules and state
├── .gitignore
└── README.md
```
