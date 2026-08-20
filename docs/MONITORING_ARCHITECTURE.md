# Monitoring Architecture

```mermaid
flowchart LR
    subgraph Application Nodes
        A[FastAPI App] -->|Exposes /metrics| B(Prometheus Exporter)
        C[Kubernetes Nodes] -->|cAdvisor| D(Node Exporter)
    end
    
    subgraph Monitoring Stack
        B -.->|Scrapes| E[(Prometheus)]
        D -.->|Scrapes| E
        
        E --> F[Grafana]
        E --> G[Alertmanager]
    end
    
    F -->|Displays Dashboards| User([DevOps Engineer])
    G -->|Sends Alerts| H([Slack / Email])
```

## Description
- **Prometheus**: Acts as the central time-series database. It scrapes metrics from the FastAPI application (which uses a Prometheus middleware) and the Kubernetes nodes.
- **Grafana**: Queries Prometheus to visualize data in custom dashboards (CPU, Memory, Request Latency).
- **Alertmanager**: Configured to route critical alerts from Prometheus to communication channels like Slack or Email.
