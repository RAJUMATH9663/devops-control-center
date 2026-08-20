def test_sonarqube_quality_gate(client, normal_token_headers):
    response = client.get("/api/v1/security/sonarqube/status", headers=normal_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["quality_gate"] == "PASSED"
    assert "metrics" in data
    assert data["metrics"]["security_rating"] == "A"


def test_trivy_vulnerability_scan(client, normal_token_headers):
    response = client.post("/api/v1/security/trivy/scan?target=repo", headers=normal_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert "vulnerabilities" in data
    assert len(data["vulnerabilities"]) >= 1


def test_compliance_scorecard(client, normal_token_headers):
    response = client.get("/api/v1/security/compliance", headers=normal_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["grade"] == "A+"
    assert "standards" in data
    assert len(data["standards"]) >= 1
