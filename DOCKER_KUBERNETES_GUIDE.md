# Docker & Kubernetes Deployment Guide

## Quick Reference

### Docker Compose (Local Development)
```bash
./deploy-docker.sh up              # Start all services
./deploy-docker.sh down            # Stop services
./deploy-docker.sh logs            # View logs
./deploy-docker.sh status          # Show status
```

### Kubernetes (Production)
```bash
./deploy-k8s.sh deploy dev         # Deploy to dev
./deploy-k8s.sh deploy staging     # Deploy to staging
./deploy-k8s.sh deploy production  # Deploy to production
./deploy-k8s.sh status             # Show status
```

---

## Docker Deployment

### Prerequisites
```bash
# Install Docker
# macOS:
brew install docker docker-compose

# Ubuntu/Debian:
sudo apt-get install docker.io docker-compose

# Windows:
choco install docker-desktop
```

### Quick Start

```bash
# 1. Navigate to project root
cd SLIIT-SE3020-SE-120-Healthcare-Microservices-Platform

# 2. Create .env file
cat > .env << 'EOF'
STRIPE_API_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
EOF

# 3. Start services
./deploy-docker.sh up

# 4. Verify services are running
./deploy-docker.sh status

# 5. View logs
./deploy-docker.sh logs
```

### Docker Compose Services

**Services Started:**
1. **MongoDB** - Data persistence
   - Port: 27017
   - Username: admin
   - Password: admin123

2. **Payment Service** - Backend API
   - Port: 8004
   - Endpoint: http://localhost:8004/api/v1
   - Health: http://localhost:8004/api/v1/payments/health

### Docker Commands

| Command | Description |
|---------|-------------|
| `./deploy-docker.sh up` | Start all services |
| `./deploy-docker.sh down` | Stop all services |
| `./deploy-docker.sh restart` | Restart services |
| `./deploy-docker.sh logs` | View all logs (follow) |
| `./deploy-docker.sh logs-service payment-service` | View specific service logs |
| `./deploy-docker.sh build` | Rebuild images |
| `./deploy-docker.sh clean` | Clean containers & volumes |
| `./deploy-docker.sh status` | Show container status |
| `./deploy-docker.sh endpoints` | Show service endpoints |
| `./deploy-docker.sh metrics` | Show resource usage |

### Testing Docker Deployment

```bash
# Check MongoDB
mongosh --host localhost -u admin -p admin123

# Check Payment Service
curl http://localhost:8004/api/v1/payments/health

# Test API Endpoint
curl -X POST http://localhost:8004/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": "test-1",
    "patientId": "patient-1",
    "doctorId": "doctor-1",
    "amount": 50.00,
    "currency": "USD",
    "paymentMethod": "STRIPE",
    "description": "Test payment",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'
```

### Docker Troubleshooting

```bash
# Check container status
docker ps -a

# View container logs
docker logs <container_id>

# Access container shell
docker exec -it <container_id> bash

# Restart specific service
docker-compose restart payment-service

# Remove dangling volumes
docker volume prune

# Full cleanup (careful!)
docker-compose down -v
```

---

## Kubernetes Deployment

### Prerequisites

```bash
# Install Kubernetes CLI
# macOS:
brew install kubectl

# Ubuntu/Debian:
sudo apt-get install kubectl

# Windows:
choco install kubernetes-cli
```

### Setup Kubernetes Cluster

**Option 1: Using Minikube (Local)**

```bash
# Install Minikube
# macOS:
brew install minikube

# Start cluster
minikube start --cpus=4 --memory=8192

# Verify
kubectl cluster-info
```

**Option 2: Using Docker Desktop (macOS/Windows)**

1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Enable Kubernetes
4. Click "Apply & Restart"

**Option 3: Using Existing Cluster**
```bash
# Configure kubectl context
kubectl config use-context <cluster-name>

# Verify access
kubectl cluster-info
```

### Kubernetes Deployment Steps

```bash
# 1. Navigate to project root
cd SLIIT-SE3020-SE-120-Healthcare-Microservices-Platform

# 2. Make script executable
chmod +x deploy-k8s.sh

# 3. Set environment variables
export STRIPE_API_KEY="sk_test_YOUR_KEY_HERE"
export STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"  
export STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"

# 4. Deploy to dev environment
./deploy-k8s.sh deploy dev

# 5. Verify deployment
./deploy-k8s.sh status

# 6. View logs
kubectl logs -f deployment/payment-service -n healthcare
```

### Kubernetes Deployment Options

```bash
# Deploy to different environments
./deploy-k8s.sh deploy dev        # Dev: 1 replica
./deploy-k8s.sh deploy staging    # Staging: 2 replicas
./deploy-k8s.sh deploy production # Production: 3 replicas

# Update deployment
./deploy-k8s.sh update dev

# Delete deployment
./deploy-k8s.sh delete

# Rollback deployment
./deploy-k8s.sh rollback

# View status
./deploy-k8s.sh status

# View logs
./deploy-k8s.sh logs

# Port forward for local access
./deploy-k8s.sh forward
# Then access: http://localhost:8004/api/v1
```

### Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                      │
├─────────────────────────────────────────────────────────┤
│  Namespace: healthcare                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ MongoDB StatefulSet                                │ │
│  │ - Persistent Volume: 10GB                          │ │
│  │ - Service: mongodb-service:27017                   │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Payment Service Deployment                         │ │
│  │ - 3 Replicas (configurable)                        │ │
│  │ - HPA: Min 2, Max 5 pods                           │ │
│  │ - Service: payment-service LoadBalancer            │ │
│  │ - Ingress: api.healthcare.local                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Kubernetes Commands

| Command | Description |
|---------|-------------|
| `kubectl get pods -n healthcare` | List pods |
| `kubectl get svc -n healthcare` | List services |
| `kubectl get deployments -n healthcare` | List deployments |
| `kubectl describe pod <name> -n healthcare` | Pod details |
| `kubectl logs -f <pod> -n healthcare` | Pod logs |
| `kubectl exec -it <pod> bash -n healthcare` | Access pod |
| `kubectl scale deployment <name> --replicas=5 -n healthcare` | Scale pods |
| `kubectl port-forward <pod> 8004:8004 -n healthcare` | Port forward |
| `kubectl top pods -n healthcare` | Resource usage |

### Kubernetes Health Checks

```bash
# Check deployment status
kubectl rollout status deployment/payment-service -n healthcare

# Check pod status
kubectl get pods -n healthcare -w

# Check resource usage
kubectl top pods -n healthcare

# Check events
kubectl get events -n healthcare --sort-by='.lastTimestamp'

# Test API
kubectl port-forward svc/payment-service 8004:80 -n healthcare
curl http://localhost:8004/api/v1/payments/health
```

---

## Comparing Docker vs Kubernetes

| Feature | Docker Compose | Kubernetes |
|---------|----------------|-----------|
| **Use Case** | Local development | Production |
| **Complexity** | Simple | Complex |
| **Scalability** | Limited | Excellent |
| **High Availability** | No | Yes |
| **Auto-scaling** | No | Yes (HPA) |
| **Self-healing** | No | Yes |
| **Rolling Updates** | Manual | Automatic |
| **Load Balancing** | Basic | Advanced |
| **Monitoring** | Limited | Extensive |
| **Cost** | Lower | Higher |

---

## Environment-Specific Configuration

### Development Environment
```bash
./deploy-docker.sh up
# Or
./deploy-k8s.sh deploy dev

# Features:
# - 1 replica
# - Local image (no push)
# - Basic monitoring
# - Shorter timeouts
```

### Staging Environment
```bash
./deploy-k8s.sh deploy staging

# Features:
# - 2 replicas
# - Network policies
# - Pod disruption budgets
# - 80% resource limits
```

### Production Environment
```bash
./deploy-k8s.sh deploy production

# Features:
# - 3-5 replicas (auto-scaling)
# - HTTPS/TLS
# - Resource limits
# - High availability
# - Monitoring & alerting
# - Backup strategy
```

---

## Monitoring & Logs

### Docker Logs
```bash
# All services
./deploy-docker.sh logs

# Specific service
./deploy-docker.sh logs-service payment-service

# With filtering
docker-compose logs payment-service | grep ERROR
docker-compose logs payment-service --tail=100 -f
```

### Kubernetes Logs
```bash
# Pod logs
kubectl logs -f pod/payment-service-xxxxx -n healthcare

# Deployment logs
kubectl logs -f deployment/payment-service -n healthcare

# Previous pod logs (crashed)
kubectl logs --previous pod/payment-service-xxxxx -n healthcare

# All containers in pod
kubectl logs pod/payment-service-xxxxx --all-containers=true -n healthcare

# Tail specific lines
kubectl logs -f deployment/payment-service --tail=50 -n healthcare
```

### Resource Monitoring

```bash
# Docker
docker stats

# Kubernetes
kubectl top pods -n healthcare
kubectl top nodes
```

---

## Backup & Recovery

### Docker Backup

```bash
# Backup MongoDB data
docker exec healthcare-mongodb mongodump --archive=/backup/backup.archive -u admin -p admin123

# Restore MongoDB data
docker exec healthcare-mongodb mongorestore --archive=/backup/backup.archive -u admin -p admin123
```

### Kubernetes Backup

```bash
# Backup MongoDB data
kubectl exec deployment/mongodb -n healthcare -- mongodump --archive=/backup/backup.archive -u admin -p admin123

# Backup Kubernetes resources
kubectl get all -n healthcare -o yaml > backup.yaml

# Restore from backup
kubectl apply -f backup.yaml
```

---

## Troubleshooting Guide

### Docker Issues

**Container won't start**
```bash
docker logs <container_id>
docker inspect <container_id>
```

**Port already in use**
```bash
lsof -i :8004
kill -9 <PID>
```

**MongoDB connection failed**
```bash
docker exec healthcare-mongodb mongosh -u admin -p admin123
```

### Kubernetes Issues

**Pod stuck in Pending**
```bash
kubectl describe pod <name> -n healthcare
kubectl get events -n healthcare
```

**Pod CrashLoopBackOff**
```bash
kubectl logs <pod> -n healthcare
kubectl describe pod <pod> -n healthcare
```

**Service not accessible**
```bash
kubectl get svc -n healthcare
kubectl get endpoints -n healthcare
kubectl port-forward svc/payment-service 8004:80 -n healthcare
```

---

## Security Best Practices

### Docker
- [ ] Use private secrets (not in Dockerfile)
- [ ] Scan images for vulnerabilities
- [ ] Use specific base image versions
- [ ] Run containers as non-root
- [ ] Limit resource usage

### Kubernetes
- [ ] Use Network Policies
- [ ] Enable RBAC
- [ ] Use Pod Security Policies
- [ ] Configure resource limits
- [ ] Use secrets for sensitive data
- [ ] Enable audit logging
- [ ] Regular security updates

---

## Performance Tuning

### Docker
```yaml
# docker-compose.yml adjustments
services:
  payment-service:
    resources:
      limits:
        memory: 2G
        cpus: '1'
      reservations:
        memory: 1G
        cpus: '0.5'
```

### Kubernetes
```yaml
# Adjust in deployment spec
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"

# HPA tuning
maxReplicas: 10
targetCPUUtilizationPercentage: 70
targetMemoryUtilizationPercentage: 80
```

---

## Cost Optimization

**Docker:** Lower cost for development, limited for production

**Kubernetes:** 
- Use HPA to scale down during off-peak
- Use spot instances where available
- Monitor and optimize resource requests
- Use PodDisruptionBudgets wisely

---

## Next Steps

1. **Complete Setup**
   - [ ] Get Stripe API keys
   - [ ] Configure .env file
   - [ ] Deploy to dev environment

2. **Testing**
   - [ ] Test payment flow
   - [ ] Verify webhooks
   - [ ] Load testing

3. **Production**
   - [ ] Switch to production keys
   - [ ] Setup monitoring
   - [ ] Configure backups
   - [ ] Enable TLS/HTTPS

---

## Support Resources

- **Docker:** https://docs.docker.com
- **Kubernetes:** https://kubernetes.io/docs
- **Docker Compose:** https://docs.docker.com/compose
- **Kubectl:** https://kubernetes.io/docs/reference/kubectl

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
**Status:** ✅ Ready for Production
