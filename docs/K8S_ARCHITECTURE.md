# Kubernetes Architecture

```mermaid
flowchart TD
    User([End User]) -->|HTTPS| IG(Ingress Controller)
    
    subgraph K8s Cluster [Kubernetes Cluster]
        IG -->|/api| SVC_BACKEND(Backend Service)
        IG -->|/| SVC_FRONTEND(Frontend Service)
        
        subgraph Backend Pods
            SVC_BACKEND --> B1[FastAPI Pod 1]
            SVC_BACKEND --> B2[FastAPI Pod 2]
        end
        
        subgraph Frontend Pods
            SVC_FRONTEND --> F1[Nginx/React Pod 1]
            SVC_FRONTEND --> F2[Nginx/React Pod 2]
        end
        
        B1 --> SVC_DB(Postgres Service)
        B2 --> SVC_DB
        
        subgraph DB StatefulSet
            SVC_DB --> P1[(Postgres Primary)]
        end
    end
```

## Description
- **Ingress**: Manages external access, TLS termination, and path-based routing.
- **Frontend & Backend**: Deployed as stateless `Deployments` with multiple replicas for High Availability.
- **Database**: Handled as a `StatefulSet` with Persistent Volume Claims (PVC) if hosted inside the cluster, or as an ExternalName service if using a managed cloud DB.
