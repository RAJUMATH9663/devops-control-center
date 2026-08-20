import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.api.deps import get_db
from app.main import app
from app.core import security
from app.models.user import User, Role

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session() -> Generator:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed roles
    if not session.query(Role).first():
        admin_role = Role(id=1, name="Admin", permissions={"all": True})
        devops_role = Role(id=2, name="DevOps", permissions={"manage_projects": True})
        dev_role = Role(id=3, name="Developer", permissions={"view_projects": True})
        session.add_all([admin_role, devops_role, dev_role])
        session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session) -> Generator:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session) -> User:
    user = db_session.query(User).filter(User.email == "test_admin@devops.io").first()
    if not user:
        user = User(
            email="test_admin@devops.io",
            hashed_password=security.get_password_hash("testpassword123"),
            full_name="Test Admin",
            is_active=True,
            role_id=1,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def normal_user(db_session) -> User:
    user = db_session.query(User).filter(User.email == "test_dev@devops.io").first()
    if not user:
        user = User(
            email="test_dev@devops.io",
            hashed_password=security.get_password_hash("testpassword123"),
            full_name="Test Developer",
            is_active=True,
            role_id=3,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def admin_token_headers(admin_user) -> dict:
    token = security.create_access_token(admin_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def normal_token_headers(normal_user) -> dict:
    token = security.create_access_token(normal_user.id)
    return {"Authorization": f"Bearer {token}"}
