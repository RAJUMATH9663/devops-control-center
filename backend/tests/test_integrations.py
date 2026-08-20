def test_docker_endpoints(client, normal_token_headers):
    res_containers = client.get("/api/v1/docker/containers", headers=normal_token_headers)
    assert res_containers.status_code == 200
    assert isinstance(res_containers.json(), list)

    res_images = client.get("/api/v1/docker/images", headers=normal_token_headers)
    assert res_images.status_code == 200
    assert isinstance(res_images.json(), list)


def test_kubernetes_endpoints(client, normal_token_headers):
    res_ns = client.get("/api/v1/kubernetes/namespaces", headers=normal_token_headers)
    assert res_ns.status_code == 200
    assert isinstance(res_ns.json(), list)

    res_deploy = client.get("/api/v1/kubernetes/deployments", headers=normal_token_headers)
    assert res_deploy.status_code == 200
    assert isinstance(res_deploy.json(), list)

    res_pods = client.get("/api/v1/kubernetes/pods", headers=normal_token_headers)
    assert res_pods.status_code == 200
    assert isinstance(res_pods.json(), list)


def test_terraform_endpoints(client, normal_token_headers):
    res_ws = client.get("/api/v1/terraform/workspaces", headers=normal_token_headers)
    assert res_ws.status_code == 200
    assert isinstance(res_ws.json(), list)


def test_ansible_endpoints(client, normal_token_headers):
    res_inv = client.get("/api/v1/ansible/inventories", headers=normal_token_headers)
    assert res_inv.status_code == 200
    assert isinstance(res_inv.json(), list)

    res_pb = client.get("/api/v1/ansible/playbooks", headers=normal_token_headers)
    assert res_pb.status_code == 200
    assert isinstance(res_pb.json(), list)


def test_jenkins_endpoints(client, normal_token_headers):
    res_jobs = client.get("/api/v1/jenkins/jobs", headers=normal_token_headers)
    assert res_jobs.status_code == 200
    assert isinstance(res_jobs.json(), list)


def test_github_endpoints(client, normal_token_headers):
    res_repos = client.get("/api/v1/github/repositories", headers=normal_token_headers)
    assert res_repos.status_code == 200
    assert isinstance(res_repos.json(), list)


def test_monitoring_endpoints(client, normal_token_headers):
    res_metrics = client.get("/api/v1/monitoring/metrics", headers=normal_token_headers)
    assert res_metrics.status_code == 200
    data = res_metrics.json()
    assert "cpu_usage" in data
    assert "memory_usage" in data

    res_alerts = client.get("/api/v1/monitoring/alerts", headers=normal_token_headers)
    assert res_alerts.status_code == 200
    assert isinstance(res_alerts.json(), list)


def test_security_endpoints(client, normal_token_headers):
    res_sast = client.get("/api/v1/security/sast", headers=normal_token_headers)
    assert res_sast.status_code == 200
    assert isinstance(res_sast.json(), list)

    res_sec_img = client.get("/api/v1/security/images", headers=normal_token_headers)
    assert res_sec_img.status_code == 200
    assert isinstance(res_sec_img.json(), list)

    res_secrets = client.get("/api/v1/security/secrets", headers=normal_token_headers)
    assert res_secrets.status_code == 200
    assert isinstance(res_secrets.json(), list)
