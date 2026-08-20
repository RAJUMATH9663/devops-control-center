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

    # 5. AI Assistant Tests
    def test_ai_log_analyzer():
        oom_log = "Error: Out of memory (OOMKilled), exit code 137"
        res = client.post("/api/v1/ai/analyze-logs", headers=dev_headers, json={"log_text": oom_log})
        assert res.status_code == 200, res.text
        assert res.json()["severity"] == "CRITICAL"

        rec_res = client.get("/api/v1/ai/recommendations", headers=dev_headers)
        assert rec_res.status_code == 200, rec_res.text
        assert len(rec_res.json()) >= 1
    tests.append(("AI Assistant: Log analyzer and recommendations", test_ai_log_analyzer))

    # 6. Notifications Tests
    def test_notifications():
        res = client.post(
            "/api/v1/notifications/test",
            headers=dev_headers,
            json={"channel_type": "slack", "target": "https://hooks.slack.com/services/test", "title": "Test Alert"}
        )
        assert res.status_code == 200, res.text
        assert res.json()["status"] in ["delivered", "failed"]
    tests.append(("Notifications: Dispatch test alert", test_notifications))

    # 7. Reports & DORA Metrics Tests
    def test_reports():
        dora_res = client.get("/api/v1/reports/dora", headers=dev_headers)
        assert dora_res.status_code == 200, dora_res.text
        assert "overall_tier" in dora_res.json()

        csv_res = client.get("/api/v1/reports/export/deployments", headers=dev_headers)
        assert csv_res.status_code == 200, csv_res.text
        assert "text/csv" in csv_res.headers["content-type"]
    tests.append(("Reports: DORA metrics and CSV deployment exports", test_reports))

    # 8. Vault Secrets & Masking Tests
    def test_vault_and_masking():
        # List paths
        res_paths = client.get("/api/v1/secrets/paths", headers=dev_headers)
        assert res_paths.status_code == 200, res_paths.text
        assert "secret/data/production/database" in res_paths.json()

        # View secret
        res_view = client.get("/api/v1/secrets/view?path=secret/data/production/database", headers=dev_headers)
        assert res_view.status_code == 200, res_view.text
        assert "••••" in str(res_view.json()["masked_data"]["password"])

        # Masking test
        raw_token = "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
        res_mask = client.post("/api/v1/secrets/mask-test", headers=dev_headers, json={"text": raw_token})
        assert res_mask.status_code == 200, res_mask.text
        assert "[MASKED_" in res_mask.json()["masked"]
    tests.append(("Vault & Security: Secret storage and automated masking", test_vault_and_masking))

    # 9. Audit Logging & WebSockets Tests
    def test_audit_and_websockets():
        # Audit trail
        res_audit = client.get("/api/v1/secrets/audit", headers=dev_headers)
        assert res_audit.status_code == 200, res_audit.text
        assert isinstance(res_audit.json(), list)

        # WebSocket broadcast
        res_bc = client.post("/ws/broadcast/test-pipe", json={"text": "Pipeline log line", "level": "info"})
        assert res_bc.status_code == 200, res_bc.text
        assert res_bc.json()["status"] == "broadcast_sent"
    tests.append(("Audit & WebSockets: Audit event recording and log broadcast", test_audit_and_websockets))

    # 10. GitHub Webhooks & K8s Operations Tests
    def test_webhooks_and_k8s():
        import hmac
        import hashlib
        import json

        # Webhook with HMAC
        secret = "devops-github-webhook-secret-key-12345"
        payload = {"ref": "refs/heads/main", "after": "0ebab5f", "repository": {"full_name": "RAJUMATH9663/devops-control-center"}}
        body = json.dumps(payload).encode("utf-8")
        sig = "sha256=" + hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
        wh_res = client.post("/api/v1/github/webhook", data=body, headers={"Content-Type": "application/json", "X-GitHub-Event": "push", "X-Hub-Signature-256": sig})
        assert wh_res.status_code == 200, wh_res.text
        assert wh_res.json()["status"] == "PROCESSED"

        # K8s Scale
        scale_res = client.post("/api/v1/kubernetes/deployments/devops-backend/scale", headers=dev_headers, json={"replicas": 3})
        assert scale_res.status_code == 200, scale_res.text
        assert scale_res.json()["current_replicas"] == 3

        # K8s Pod Restart & Logs
        restart_res = client.post("/api/v1/kubernetes/pods/devops-backend-7c598d9f4-k8w2q/restart", headers=dev_headers)
        assert restart_res.status_code == 200, restart_res.text

        log_res = client.get("/api/v1/kubernetes/pods/devops-backend-7c598d9f4-k8w2q/logs", headers=dev_headers)
        assert log_res.status_code == 200, log_res.text
        assert "logs" in log_res.json()
    tests.append(("Webhooks & K8s: HMAC Webhooks, replica scaling, pod restart & logs", test_webhooks_and_k8s))

    # 11. Terraform & Ansible Live Runners Tests
    def test_terraform_and_ansible():
        # Terraform plan
        tf_plan = client.post("/api/v1/terraform/workspaces/aws-production-vpc-eks/plan", headers=dev_headers)
        assert tf_plan.status_code == 200, tf_plan.text
        assert "run" in tf_plan.json()
        run_id = tf_plan.json()["run"]["id"]

        # Terraform state
        tf_state = client.get("/api/v1/terraform/workspaces/aws-production-vpc-eks/state", headers=dev_headers)
        assert tf_state.status_code == 200, tf_state.text
        assert "outputs" in tf_state.json()

        # Terraform logs
        tf_logs = client.get(f"/api/v1/terraform/runs/{run_id}/logs", headers=dev_headers)
        assert tf_logs.status_code == 200, tf_logs.text

        # Ansible execute
        ans_exec = client.post("/api/v1/ansible/playbooks/1/execute?inventory_id=1", headers=dev_headers)
        assert ans_exec.status_code == 200, ans_exec.text
        assert "job" in ans_exec.json()
        job_id = ans_exec.json()["job"]["id"]

        # Ansible logs
        ans_logs = client.get(f"/api/v1/ansible/jobs/{job_id}/logs", headers=dev_headers)
        assert ans_logs.status_code == 200, ans_logs.text
        assert "PLAY" in ans_logs.json()["logs"]
    tests.append(("Terraform & Ansible: Plan, apply, state inspection, and playbook execution", test_terraform_and_ansible))

    # 12. Observability & User Profile Tests
    def test_observability_and_profile():
        # Metrics
        met_res = client.get("/api/v1/monitoring/metrics", headers=dev_headers)
        assert met_res.status_code == 200, met_res.text
        assert "cpu_usage" in met_res.json()

        # Alerts
        alt_res = client.get("/api/v1/monitoring/alerts", headers=dev_headers)
        assert alt_res.status_code == 200, alt_res.text
        assert len(alt_res.json()) >= 1

        # Profile update
        prof_res = client.put("/api/v1/auth/profile", headers=dev_headers, json={"full_name": "DevOps Architect"})
        assert prof_res.status_code == 200, prof_res.text
        assert prof_res.json()["full_name"] == "DevOps Architect"

        # Password change
        pwd_res = client.put(
            "/api/v1/auth/change-password",
            headers=dev_headers,
            json={"current_password": "testpassword123", "new_password": "newsecretpassword123"}
        )
        assert pwd_res.status_code == 200, pwd_res.text
    tests.append(("Observability & Profile: Prometheus telemetry, alerts, profile and password change", test_observability_and_profile))

    # 13. SonarQube SAST & Trivy Security Scanners Tests
    def test_security_scanners():
        # SonarQube
        sonar_res = client.get("/api/v1/security/sonarqube/status", headers=dev_headers)
        assert sonar_res.status_code == 200, sonar_res.text
        assert sonar_res.json()["quality_gate"] == "PASSED"

        # Trivy
        trivy_res = client.post("/api/v1/security/trivy/scan?target=repo", headers=dev_headers)
        assert trivy_res.status_code == 200, trivy_res.text
        assert trivy_res.json()["status"] == "COMPLETED"

        # Compliance
        comp_res = client.get("/api/v1/security/compliance", headers=dev_headers)
        assert comp_res.status_code == 200, comp_res.text
        assert comp_res.json()["grade"] == "A+"
    tests.append(("Security Scanners: SonarQube quality gate, Trivy CVE scan, and CIS compliance", test_security_scanners))

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
