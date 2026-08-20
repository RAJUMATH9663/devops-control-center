import logging
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal, Base
from app.core import security
from app.models.user import User, Role
from app.models.project import Project, Repository
from app.models.deployment import Pipeline, Deployment
from app.models.infrastructure import Cluster, Namespace, Server
from app.models.settings import Setting, AuditLog

logger = logging.getLogger(__name__)

DEFAULT_ROLES = [
    {
        "id": 1,
        "name": "Admin",
        "permissions": {
            "all": True,
            "manage_users": True,
            "manage_projects": True,
            "execute_deployments": True,
            "manage_infrastructure": True,
            "view_audit_logs": True,
        },
    },
    {
        "id": 2,
        "name": "DevOps",
        "permissions": {
            "manage_projects": True,
            "execute_deployments": True,
            "manage_infrastructure": True,
            "view_audit_logs": True,
            "view_metrics": True,
        },
    },
    {
        "id": 3,
        "name": "Developer",
        "permissions": {
            "view_projects": True,
            "trigger_pipelines": True,
            "view_logs": True,
            "view_metrics": True,
        },
    },
]

DEFAULT_SETTINGS = [
    {"key": "system.theme", "value": "dark", "is_encrypted": False},
    {"key": "system.notifications_enabled", "value": "true", "is_encrypted": False},
    {"key": "security.session_timeout_minutes", "value": "10080", "is_encrypted": False},
    {"key": "integrations.github.enabled", "value": "true", "is_encrypted": False},
    {"key": "integrations.jenkins.enabled", "value": "true", "is_encrypted": False},
    {"key": "integrations.kubernetes.enabled", "value": "true", "is_encrypted": False},
    {"key": "integrations.docker.enabled", "value": "true", "is_encrypted": False},
    {"key": "integrations.monitoring.prometheus_url", "value": "http://prometheus:9090", "is_encrypted": False},
]


def init_db(db: Session = None) -> None:
    """
    Initialize database tables and seed default roles, users, and settings.
    """
    # Create tables if not present
    Base.metadata.create_all(bind=engine)

    close_session_at_end = False
    if db is None:
        db = SessionLocal()
        close_session_at_end = True

    try:
        # 1. Seed Roles
        for role_data in DEFAULT_ROLES:
            role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not role:
                role = Role(
                    id=role_data["id"],
                    name=role_data["name"],
                    permissions=role_data["permissions"],
                )
                db.add(role)
        db.commit()

        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        devops_role = db.query(Role).filter(Role.name == "DevOps").first()
        dev_role = db.query(Role).filter(Role.name == "Developer").first()

        # 2. Seed Default Admin User
        admin_email = "admin@devops.io"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=security.get_password_hash("adminpassword123"),
                full_name="System Administrator",
                is_active=True,
                role_id=admin_role.id if admin_role else 1,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            logger.info(f"Created default admin user: {admin_email}")

        # Seed Demo DevOps User
        devops_email = "devops@devops.io"
        if not db.query(User).filter(User.email == devops_email).first():
            devops_user = User(
                email=devops_email,
                hashed_password=security.get_password_hash("adminpassword123"),
                full_name="DevOps Lead",
                is_active=True,
                role_id=devops_role.id if devops_role else 2,
            )
            db.add(devops_user)

        # Seed Demo Developer User
        dev_email = "developer@devops.io"
        if not db.query(User).filter(User.email == dev_email).first():
            dev_user = User(
                email=dev_email,
                hashed_password=security.get_password_hash("adminpassword123"),
                full_name="Frontend Developer",
                is_active=True,
                role_id=dev_role.id if dev_role else 3,
            )
            db.add(dev_user)
        db.commit()

        # 3. Seed Default Settings
        for setting_data in DEFAULT_SETTINGS:
            existing = db.query(Setting).filter(Setting.key == setting_data["key"]).first()
            if not existing:
                setting = Setting(
                    key=setting_data["key"],
                    value=setting_data["value"],
                    is_encrypted=setting_data["is_encrypted"],
                )
                db.add(setting)
        db.commit()

        # 4. Seed Initial Clusters if empty
        if not db.query(Cluster).first():
            c1 = Cluster(name="prod-cluster-us-east", kubeconfig_ref="vault://secret/k8s/prod-cluster", provider="AWS EKS")
            c2 = Cluster(name="staging-cluster-eu-west", kubeconfig_ref="vault://secret/k8s/staging-cluster", provider="GCP GKE")
            c3 = Cluster(name="local-dev-cluster", kubeconfig_ref="local://~/.kube/config", provider="Minikube")
            db.add_all([c1, c2, c3])
            db.commit()

            n1 = Namespace(cluster_id=c1.id, name="production")
            n2 = Namespace(cluster_id=c1.id, name="monitoring")
            n3 = Namespace(cluster_id=c2.id, name="staging")
            n4 = Namespace(cluster_id=c3.id, name="default")
            db.add_all([n1, n2, n3, n4])
            db.commit()

        # 5. Seed Initial Servers if empty
        if not db.query(Server).first():
            s1 = Server(hostname="web-prod-01.infra.internal", ip_address="10.0.1.101", ansible_group="webservers")
            s2 = Server(hostname="web-prod-02.infra.internal", ip_address="10.0.1.102", ansible_group="webservers")
            s3 = Server(hostname="db-primary.infra.internal", ip_address="10.0.2.201", ansible_group="databases")
            db.add_all([s1, s2, s3])
            db.commit()

        # 6. Seed Initial Demo Project if empty
        if not db.query(Project).first():
            p = Project(
                name="DevOps Control Center Core",
                description="Main microservices and dashboard management repository",
                owner_id=admin_user.id if admin_user else 1,
            )
            db.add(p)
            db.commit()

            repo = Repository(
                project_id=p.id,
                github_repo_url="https://github.com/acme-corp/devops-control-center",
                default_branch="main",
            )
            pipe = Pipeline(
                project_id=p.id,
                jenkins_job_name="backend-core-pipeline",
                status="success",
            )
            db.add_all([repo, pipe])
            db.commit()

            dep = Deployment(
                pipeline_id=pipe.id,
                environment="production",
                status="success",
                triggered_by=admin_user.id if admin_user else 1,
            )
            db.add(dep)
            db.commit()

        logger.info("Database initialized and seeded successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing database: {e}")
        raise
    finally:
        if close_session_at_end:
            db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
