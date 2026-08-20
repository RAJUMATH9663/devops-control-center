# CI/CD Pipeline Architecture

```mermaid
flowchart TD
    A[Developer Pushes Code] --> B(GitHub)
    B -->|Webhook| C{GitHub Actions / Jenkins}
    
    subgraph CI Pipeline
        C --> D[Linting & Unit Tests]
        D --> E[SonarQube Code Scan]
        E --> F[Build Docker Image]
        F --> G[Trivy Container Scan]
    end
    
    subgraph CD Pipeline
        G --> H[Push to Container Registry]
        H --> I[Update Kubernetes Manifests]
        I --> J[ArgoCD / Kubectl Apply]
    end
    
    J --> K((Deployed to K8s))
    
    C -- Fails --> L[Notify via Slack/Email]
```

## Description
1. **Continuous Integration**: On every PR or push to main, automated tests and security scans run. If SonarQube or Trivy detect critical issues, the build fails.
2. **Continuous Deployment**: Once the Docker image is built, scanned, and pushed to the registry, the deployment process triggers. For staging, this is automatic. For production, it may require manual approval.
