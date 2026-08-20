# DevOps Control Center - Production Deployment Guide

This guide provides step-by-step instructions for deploying the **DevOps Control Center** platform in production environments.

---

## 1. Prerequisites

- **Kubernetes**: v1.26+ or **Docker Engine**: v24.0+ with Docker Compose v2.20+
- **Helm**: v3.12+ (for Kubernetes deployments)
- **PostgreSQL**: v15+ (bundled or external RDS/Cloud SQL)
- **Domain & SSL**: Valid DNS hostname with TLS certificate

---

## 2. Deployment Option A: Kubernetes via Helm Chart (Recommended)

### Step 1: Add or Clone the Repository
```bash
git clone https://github.com/RAJUMATH9663/devops-control-center.git
cd devops-control-center/helm/devops-control-center
```

### Step 2: Configure Values
Review and customize `values.yaml`:
```yaml
global:
  environment: production
  domain: control-center.yourdomain.com

backend:
  replicaCount: 3
  resources:
    limits:
      cpu: 1000m
      memory: 1024Mi

postgresql:
  persistence:
    size: 50Gi
    storageClass: "gp3"
```

### Step 3: Install the Helm Chart
```bash
kubectl create namespace devops-control-center
helm install devops-control-center ./ --namespace devops-control-center
```

### Step 4: Verify Deployment Status
```bash
kubectl get pods,svc,ingress -n devops-control-center
```

---

## 3. Deployment Option B: Production Docker Compose

### Step 1: Configure Environment Variables
Create `.env.prod`:
```ini
POSTGRES_DB=devops_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_db_password
SECRET_KEY=generate_a_random_64_character_hex_key
```

### Step 2: Launch Containers
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Step 3: Verify Health
```bash
docker compose -f docker-compose.prod.yml ps
curl -f http://localhost:8000/api/v1/health
```

---

## 4. Initial Database Seeding & Admin Login

The platform automatically runs database migrations and seeds initial administrative users upon startup.

- **Default Admin Account**: `admin@devops.io`
- **Default Password**: `adminpassword123` *(Must be changed immediately via Settings -> Profile & Security)*

---

## 5. Security & Maintenance Checklist

- [ ] Change default administrator password in Settings.
- [ ] Configure GitHub PAT & Jenkins API tokens in Integration Settings.
- [ ] Set up Slack/Discord webhook alerts in Notification Settings.
- [ ] Configure Prometheus Alertmanager scrape targets.
- [ ] Enable TLS termination via Cert-Manager or Nginx Ingress.
