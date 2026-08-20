import hmac
import hashlib
import json

def test_github_webhook_push(client):
    secret = "devops-github-webhook-secret-key-12345"
    payload = {
        "ref": "refs/heads/main",
        "after": "0ebab5fa1b2c3d4",
        "repository": {"full_name": "RAJUMATH9663/devops-control-center"},
        "sender": {"login": "rajumath"},
        "head_commit": {"message": "feat: test webhook integration"}
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    signature = "sha256=" + hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()

    response = client.post(
        "/api/v1/github/webhook",
        data=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "X-GitHub-Event": "push",
            "X-Hub-Signature-256": signature
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PROCESSED"
    assert data["event"] == "push"
    assert len(data["actions_triggered"]) >= 1


def test_github_webhook_invalid_signature(client):
    payload = {"repository": {"full_name": "test/repo"}}
    response = client.post(
        "/api/v1/github/webhook",
        json=payload,
        headers={
            "X-GitHub-Event": "push",
            "X-Hub-Signature-256": "sha256=invalid_signature_hash_12345"
        }
    )
    assert response.status_code == 401


def test_github_webhook_history(client, normal_token_headers):
    response = client.get("/api/v1/github/webhooks/history", headers=normal_token_headers)
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    assert len(history) >= 1


def test_k8s_scale_deployment(client, normal_token_headers):
    response = client.post(
        "/api/v1/kubernetes/deployments/devops-backend/scale",
        headers=normal_token_headers,
        json={"replicas": 4, "namespace": "devops-control-center"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_replicas"] == 4
    assert data["status"] == "Scaled"


def test_k8s_restart_pod(client, normal_token_headers):
    response = client.post(
        "/api/v1/kubernetes/pods/devops-backend-7c598d9f4-k8w2q/restart?namespace=devops-control-center",
        headers=normal_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Restarted"


def test_k8s_pod_logs(client, normal_token_headers):
    response = client.get(
        "/api/v1/kubernetes/pods/devops-backend-7c598d9f4-k8w2q/logs?namespace=devops-control-center",
        headers=normal_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "logs" in data
    assert "Application worker" in data["logs"]
