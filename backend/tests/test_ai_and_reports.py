def test_ai_log_analyzer_oom(client, normal_token_headers):
    oom_log = """
    [INFO] Starting worker process
    [WARN] High memory pressure detected
    java.lang.OutOfMemoryError: Java heap space
    Container exited with code 137 (OOMKilled)
    """
    response = client.post(
        "/api/v1/ai/analyze-logs",
        headers=normal_token_headers,
        json={"log_text": oom_log, "context": "jenkins-build"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "CRITICAL"
    assert "OOM" in data["summary"] or "Memory" in data["summary"]
    assert len(data["suggested_fixes"]) > 0
    assert len(data["fix_commands"]) > 0


def test_ai_log_analyzer_connection_refused(client, normal_token_headers):
    conn_log = "Error: dial tcp 10.0.2.201:5432: connect: connection refused"
    response = client.post(
        "/api/v1/ai/analyze-logs",
        headers=normal_token_headers,
        json={"log_text": conn_log},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "HIGH"
    assert "Connection" in data["summary"]


def test_ai_recommendations(client, normal_token_headers):
    response = client.get("/api/v1/ai/recommendations", headers=normal_token_headers)
    assert response.status_code == 200
    recs = response.json()
    assert isinstance(recs, list)
    assert len(recs) >= 1
    assert "category" in recs[0]


def test_notifications_dispatch(client, normal_token_headers):
    response = client.post(
        "/api/v1/notifications/test",
        headers=normal_token_headers,
        json={
            "channel_type": "slack",
            "target": "https://hooks.slack.com/services/dummy/test/webhook",
            "title": "Automated Test Alert",
            "message": "Testing notification dispatch",
            "severity": "success"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["delivered", "failed"]


def test_reports_dora_and_export(client, normal_token_headers):
    # DORA metrics
    dora_res = client.get("/api/v1/reports/dora", headers=normal_token_headers)
    assert dora_res.status_code == 200
    assert "overall_tier" in dora_res.json()

    # CSV Export
    csv_res = client.get("/api/v1/reports/export/deployments", headers=normal_token_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "id,pipeline_id,environment,status,triggered_by,timestamp" in csv_res.text
