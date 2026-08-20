def test_terraform_plan_and_apply(client, normal_token_headers):
    # Test plan
    plan_res = client.post("/api/v1/terraform/workspaces/aws-production-vpc-eks/plan", headers=normal_token_headers)
    assert plan_res.status_code == 200
    assert "run" in plan_res.json()
    run_id = plan_res.json()["run"]["id"]

    # Test state outputs
    state_res = client.get("/api/v1/terraform/workspaces/aws-production-vpc-eks/state", headers=normal_token_headers)
    assert state_res.status_code == 200
    assert "outputs" in state_res.json()

    # Test run logs
    logs_res = client.get(f"/api/v1/terraform/runs/{run_id}/logs", headers=normal_token_headers)
    assert logs_res.status_code == 200
    assert "Terraform" in logs_res.json()["logs"]


def test_ansible_playbook_execution(client, normal_token_headers):
    # Test execute playbook
    exec_res = client.post("/api/v1/ansible/playbooks/1/execute?inventory_id=1", headers=normal_token_headers)
    assert exec_res.status_code == 200
    assert "job" in exec_res.json()
    job_id = exec_res.json()["job"]["id"]

    # Test job logs
    logs_res = client.get(f"/api/v1/ansible/jobs/{job_id}/logs", headers=normal_token_headers)
    assert logs_res.status_code == 200
    assert "PLAY" in logs_res.json()["logs"]


def test_monitoring_prometheus_metrics_and_alerts(client, normal_token_headers):
    # Metrics
    metrics_res = client.get("/api/v1/monitoring/metrics", headers=normal_token_headers)
    assert metrics_res.status_code == 200
    data = metrics_res.json()
    assert "cpu_usage" in data
    assert "memory_usage" in data

    # Alert rules
    alerts_res = client.get("/api/v1/monitoring/alerts", headers=normal_token_headers)
    assert alerts_res.status_code == 200
    assert len(alerts_res.json()) >= 1


def test_user_profile_and_password_change(client, normal_token_headers):
    # Update profile
    profile_res = client.put(
        "/api/v1/auth/profile",
        headers=normal_token_headers,
        json={"full_name": "Updated Engineer"}
    )
    assert profile_res.status_code == 200
    assert profile_res.json()["full_name"] == "Updated Engineer"

    # Change password
    pwd_res = client.put(
        "/api/v1/auth/change-password",
        headers=normal_token_headers,
        json={"current_password": "testpassword123", "new_password": "newsecretpassword123"}
    )
    assert pwd_res.status_code == 200
    assert "successfully" in pwd_res.json()["message"]
