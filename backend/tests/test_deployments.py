def test_pipeline_and_deployment_flow(client, normal_token_headers):
    # 1. Create a Project first
    proj_res = client.post(
        "/api/v1/projects/",
        headers=normal_token_headers,
        json={"name": "Deploy Test App", "description": "Testing deployments"},
    )
    assert proj_res.status_code == 200
    project_id = proj_res.json()["id"]

    # 2. Create Pipeline
    pipe_res = client.post(
        "/api/v1/deployments/pipelines",
        headers=normal_token_headers,
        json={
            "project_id": project_id,
            "jenkins_job_name": "test-pipeline-job",
            "status": "idle",
        },
    )
    assert pipe_res.status_code == 200
    pipe_data = pipe_res.json()
    assert pipe_data["jenkins_job_name"] == "test-pipeline-job"
    pipeline_id = pipe_data["id"]

    # 3. Create Deployment
    dep_res = client.post(
        f"/api/v1/deployments/?pipeline_id={pipeline_id}",
        headers=normal_token_headers,
        json={"environment": "staging"},
    )
    assert dep_res.status_code == 200
    assert dep_res.json()["environment"] == "staging"
    assert dep_res.json()["status"] == "pending"

    # 4. List Deployments
    list_res = client.get("/api/v1/deployments/", headers=normal_token_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
