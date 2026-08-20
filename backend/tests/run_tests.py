"""
DevOps Control Center - Standalone Test Runner
Executes backend tests using FastAPI TestClient and in-memory SQLite.
"""
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.api.deps import get_db
from app.main import app
from app.core import security
from app.models.user import User, Role

# Setup in-memory SQLite
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_all_tests():
    print("=" * 60)
    print("RUNNING BACKEND AUTOMATED TEST SUITE")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed roles
    admin_role = Role(id=1, name="Admin", permissions={"all": True})
    devops_role = Role(id=2, name="DevOps", permissions={"manage_projects": True})
    dev_role = Role(id=3, name="Developer", permissions={"view_projects": True})
    session.add_all([admin_role, devops_role, dev_role])
    session.commit()

    # Seed users
    admin_user = User(
        email="test_admin@devops.io",
        hashed_password=security.get_password_hash("testpassword123"),
        full_name="Test Admin",
        is_active=True,
        role_id=1,
    )
    dev_user = User(
        email="test_dev@devops.io",
        hashed_password=security.get_password_hash("testpassword123"),
        full_name="Test Developer",
        is_active=True,
        role_id=3,
    )
    session.add_all([admin_user, dev_user])
    session.commit()

    def override_get_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    admin_token = security.create_access_token(admin_user.id)
    dev_token = security.create_access_token(dev_user.id)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    dev_headers = {"Authorization": f"Bearer {dev_token}"}

    tests = []
    
    # 1. Auth Tests
    def test_auth_register():
        res = client.post("/api/v1/auth/register", json={"email": "new@devops.io", "password": "pwd", "full_name": "New"})
        assert res.status_code == 200, res.text
    tests.append(("Auth: Register new user", test_auth_register))

    def test_auth_login():
        res = client.post("/api/v1/auth/login", data={"username": "test_dev@devops.io", "password": "testpassword123"})
        assert res.status_code == 200, res.text
        assert "access_token" in res.json()
    tests.append(("Auth: Login and obtain JWT", test_auth_login))

    def test_auth_me():
        res = client.get("/api/v1/auth/me", headers=dev_headers)
        assert res.status_code == 200, res.text
        assert res.json()["email"] == "test_dev@devops.io"
    tests.append(("Auth: Retrieve /me profile", test_auth_me))

    # 2. Project Tests
    def test_project_crud():
        # Create
        res = client.post("/api/v1/projects/", headers=dev_headers, json={"name": "Automated Project", "description": "Test"})
        assert res.status_code == 200, res.text
        p_id = res.json()["id"]

        # Read
        res = client.get(f"/api/v1/projects/{p_id}", headers=dev_headers)
        assert res.status_code == 200, res.text

        # List
        res = client.get("/api/v1/projects/", headers=dev_headers)
        assert res.status_code == 200, res.text
        assert len(res.json()) >= 1

        # Delete
        res = client.delete(f"/api/v1/projects/{p_id}", headers=dev_headers)
        assert res.status_code == 200, res.text
    tests.append(("Projects: CRUD operations", test_project_crud))

    # 3. Deployment Tests
    def test_deployments_flow():
        p_res = client.post("/api/v1/projects/", headers=dev_headers, json={"name": "Deploy App", "description": "Test"})
        p_id = p_res.json()["id"]

        pipe_res = client.post("/api/v1/deployments/pipelines", headers=dev_headers, json={"project_id": p_id, "jenkins_job_name": "job-1", "status": "idle"})
        assert pipe_res.status_code == 200, pipe_res.text
        pipe_id = pipe_res.json()["id"]

        dep_res = client.post(f"/api/v1/deployments/?pipeline_id={pipe_id}", headers=dev_headers, json={"environment": "prod"})
        assert dep_res.status_code == 200, dep_res.text
        assert dep_res.json()["environment"] == "prod"
    tests.append(("Deployments: Pipelines and Deployment creation", test_deployments_flow))

    # 4. Integrations Tests
    def test_integrations_endpoints():
        endpoints = [
            "/api/v1/docker/containers",
            "/api/v1/docker/images",
            "/api/v1/kubernetes/namespaces",
            "/api/v1/kubernetes/deployments",
            "/api/v1/terraform/workspaces",
            "/api/v1/ansible/inventories",
            "/api/v1/jenkins/jobs",
            "/api/v1/github/repositories",
            "/api/v1/monitoring/metrics",
            "/api/v1/security/sast",
        ]
        for ep in endpoints:
            res = client.get(ep, headers=dev_headers)
            assert res.status_code == 200, f"Failed on {ep}: {res.text}"
    tests.append(("Integrations: All DevOps tool endpoints respond 200 OK", test_integrations_endpoints))

    # Run tests
    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            failed += 1

    print("=" * 60)
    print(f"SUMMARY: {passed} passed, {failed} failed out of {len(tests)} tests.")
    print("=" * 60)
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
