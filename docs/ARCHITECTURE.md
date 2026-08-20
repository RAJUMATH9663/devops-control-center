# DevOps Control Center - System Architecture

Comprehensive architectural overview and topology diagrams for the **DevOps Control Center** platform.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    Client[Web Browser / React 19 Frontend]
    Ingress[Nginx Ingress / Reverse Proxy]
    Backend[FastAPI Backend Service]
    Postgres[(PostgreSQL 15 Database)]
    Vault[(HashiCorp Vault Secret Store)]
    Prometheus[Prometheus Metrics Exporter]
    Loki[Loki Log Aggregator]
    
    GitHub[GitHub API & Webhooks]
    Jenkins[Jenkins CI/CD Server]
    K8sCluster[Kubernetes Cluster API]
    Terraform[Terraform Cloud / AWS API]
    Ansible[Ansible Automation Engine]

    Client -->|HTTPS / WSS| Ingress
    Ingress -->|REST / WebSocket| Backend
    Ingress -->|Static Assets| Client

    Backend -->|SQLAlchemy ORM| Postgres
    Backend -->|KV v2 Client| Vault
    Backend -->|PromQL| Prometheus
    Backend -->|LogQL| Loki

    Backend -->|Webhooks & REST| GitHub
    Backend -->|Pipeline Triggers| Jenkins
    Backend -->|K8s API / Scale / Restart| K8sCluster
    Backend -->|Plan & Apply| Terraform
    Backend -->|Playbook Runner| Ansible
```

---

## 2. Real-Time WebSocket & Log Redaction Pipeline

```mermaid
sequenceDiagram
    participant User as Developer UI (React LogTerminal)
    participant WS as FastAPI WebSocket Manager (/ws/logs)
    participant Engine as CI/CD / K8s / Ansible Service
    participant Vault as Vault Regex Masking Engine

    User->>WS: Connect /ws/logs/{channel_id} (Bearer JWT)
    WS-->>User: Connection Accepted (Subscribed to channel)
    Engine->>WS: Stream Raw Log Line (e.g. AWS_KEY=wJalrXUt...)
    WS->>Vault: sanitize_secrets(raw_log)
    Vault-->>WS: Redacted Log Line (AWS_KEY=[MASKED_AWS_KEY])
    WS-->>User: Push Redacted Log Line
    User->>User: Render ANSI Highlighting & Auto-Scroll
```

---

## 3. GitHub Webhook CI/CD Trigger Flow

```mermaid
sequenceDiagram
    participant GH as GitHub (git push / PR)
    participant WH as Webhook Receiver (/api/v1/github/webhook)
    participant Dispatcher as Webhook Dispatcher
    participant Jenkins as Jenkins / K8s Pipeline

    GH->>WH: POST Webhook Payload (Header: X-Hub-Signature-256)
    WH->>Dispatcher: verify_signature(payload, hmac_key)
    alt Signature Valid
        Dispatcher->>Dispatcher: Parse Event (Push / PR / Release)
        Dispatcher->>Jenkins: Trigger Associated Build Pipeline
        Dispatcher->>WH: 200 OK (Processed & Actions Triggered)
    else Signature Invalid
        WH-->>GH: 401 Unauthorized (Invalid Signature)
    end
```

---

## 4. Kubernetes Production Deployment Topology

```mermaid
graph LR
    subgraph Kubernetes Namespace: devops-control-center
        Ingress[Ingress: control-center.devops.internal]
        FrontendSvc[frontend-svc:80]
        BackendSvc[backend-svc:8000]
        PostgresSvc[postgres-svc:5432]
        
        FrontendPods[Frontend Replicas x2]
        BackendPods[Backend Replicas x2]
        PostgresPod[PostgreSQL StatefulSet x1]
        PVC[(Persistent Volume: 20Gi gp3)]

        Ingress -->|/| FrontendSvc
        Ingress -->|/api & /ws| BackendSvc
        FrontendSvc --> FrontendPods
        BackendSvc --> BackendPods
        BackendPods --> PostgresSvc
        PostgresSvc --> PostgresPod
        PostgresPod --> PVC
    end
```
