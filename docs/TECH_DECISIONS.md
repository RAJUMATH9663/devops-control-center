# Technology Decisions

## Frontend
- **React**: Chosen for its robust ecosystem and component-based architecture.
- **Vite**: Chosen over Create React App (CRA) or Webpack for its blazing fast hot-module replacement and optimized builds.
- **TailwindCSS**: Chosen for rapid UI styling without leaving the HTML/TSX files. Promotes consistency across the UI.
- **React Router**: Standard routing library for React SPAs.
- **TanStack Query (React Query)**: For efficient server-state management, caching, and background data synchronization.
- **Axios**: Provides a cleaner API for HTTP requests compared to the native fetch API, and allows for easy interceptor configuration for JWT.

## Backend
- **FastAPI**: Chosen for its high performance (built on Starlette and Pydantic) and automatic OpenAPI/Swagger documentation generation.
- **Python**: A universally understood language in the DevOps space, making it easy for contributors to understand and extend the backend.
- **SQLAlchemy**: The standard Python ORM. Provides database agnosticism and powerful querying capabilities.
- **Alembic**: Used for database migrations in conjunction with SQLAlchemy.
- **Pydantic**: For strict data validation and parsing of request/response payloads.

## Database
- **PostgreSQL**: An enterprise-grade relational database, highly reliable and capable of handling complex relational schemas.

## DevOps Integrations
- **Jenkins/Docker/K8s/Terraform/Ansible**: We are integrating with these tools rather than replacing them. They represent the industry standard toolchain for modern software delivery.
