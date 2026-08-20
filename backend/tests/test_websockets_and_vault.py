from app.services.vault_service import vault_service

def test_vault_list_paths(client, normal_token_headers):
    response = client.get("/api/v1/secrets/paths", headers=normal_token_headers)
    assert response.status_code == 200
    paths = response.json()
    assert isinstance(paths, list)
    assert "secret/data/production/database" in paths


def test_vault_view_secret(client, normal_token_headers):
    response = client.get(
        "/api/v1/secrets/view",
        headers=normal_token_headers,
        params={"path": "secret/data/production/database"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["path"] == "secret/data/production/database"
    assert "username" in data["keys"]
    assert "password" in data["keys"]
    # Verify values are masked
    assert "••••" in str(data["masked_data"]["password"])


def test_secret_masking_filter(client, normal_token_headers):
    raw_text = "Deploying with AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE and GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz12"
    response = client.post(
        "/api/v1/secrets/mask-test",
        headers=normal_token_headers,
        json={"text": raw_text},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_modified"] is True
    assert "AKIAIOSFODNN7EXAMPLE" not in data["masked"]
    assert "ghp_1234567890abcdefghijklmnopqrstuvwxyz12" not in data["masked"]
    assert "[MASKED_" in data["masked"]


def test_audit_trail_endpoint(client, normal_token_headers):
    response = client.get("/api/v1/secrets/audit", headers=normal_token_headers)
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    # The previous secret view test should have recorded an audit event
    assert len(logs) >= 1
    assert any(log["action"] == "SECRET_ACCESS" for log in logs)


def test_websocket_broadcast_rest(client, normal_token_headers):
    response = client.post(
        "/ws/broadcast/build-101",
        json={"text": "Build completed with AWS_KEY=AKIAIOSFODNN7EXAMPLE", "level": "info"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "broadcast_sent"
