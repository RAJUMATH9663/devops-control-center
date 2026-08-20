def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@devops.io",
            "password": "securepassword123",
            "full_name": "New Test User",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@devops.io"
    assert data["full_name"] == "New Test User"
    assert "id" in data


def test_register_existing_user(client, normal_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": normal_user.email,
            "password": "anotherpassword",
            "full_name": "Duplicate User",
        },
    )
    assert response.status_code == 400


def test_login_access_token(client, normal_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": normal_user.email,
            "password": "testpassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, normal_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": normal_user.email,
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 400


def test_read_users_me(client, normal_token_headers, normal_user):
    response = client.get("/api/v1/auth/me", headers=normal_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == normal_user.email
    assert data["full_name"] == normal_user.full_name


def test_forgot_password(client, normal_user):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": normal_user.email},
    )
    assert response.status_code == 200
    assert "message" in response.json()
