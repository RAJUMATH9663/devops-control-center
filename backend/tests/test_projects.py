def test_create_and_read_project(client, normal_token_headers):
    # Create project
    response = client.post(
        "/api/v1/projects/",
        headers=normal_token_headers,
        json={
            "name": "Integration Test Project",
            "description": "A project created during automated testing",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Integration Test Project"
    project_id = data["id"]

    # Read project by ID
    get_res = client.get(f"/api/v1/projects/{project_id}", headers=normal_token_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Integration Test Project"

    # List projects
    list_res = client.get("/api/v1/projects/", headers=normal_token_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Delete project
    del_res = client.delete(f"/api/v1/projects/{project_id}", headers=normal_token_headers)
    assert del_res.status_code == 200


def test_unauthorized_access(client):
    response = client.get("/api/v1/projects/")
    assert response.status_code in [401, 403]
