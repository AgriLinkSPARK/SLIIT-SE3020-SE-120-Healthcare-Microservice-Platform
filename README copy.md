# Healthcare Microservices Platform

This repository includes Docker and Kubernetes deployment support for a multi-service healthcare platform.

## Services Covered in Kubernetes

- mongodb
- payment-service
- auth-service
- appointment-service
- doctor-service
- patient-service
- notification-service
- telemedicine-service
- frontend
- api-gateway

## Prerequisites

- Docker Desktop (with Kubernetes enabled) or another running Kubernetes cluster
- kubectl configured to your cluster
- Docker CLI

Quick checks:

```bash
kubectl config current-context
kubectl cluster-info
docker --version
```

## 1) Start All Services on Kubernetes

From project root:

```bash
cd /Users/aenuka/Documents/GitHub/SLIIT-SE3020-SE-120-Healthcare-Microservices-Platform
chmod +x ./deploy-k8s.sh
```

Set required Stripe variables (use your own values):

```bash
export STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
export STRIPE_API_KEY="sk_test_your_key"
export STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

Deploy full stack to dev:

```bash
./deploy-k8s.sh deploy dev
```

## 2) Check Everything Is Healthy

Run the following checks:

```bash
kubectl get deployments -n healthcare
kubectl get pods -n healthcare -o wide
kubectl get svc -n healthcare
kubectl get endpointslices -n healthcare
```

Expected:

- Deployments show READY as desired replicas (for example 1/1 or 2/2)
- Pods are Running
- Services are listed
- EndpointSlices are not empty for active services

Quick unhealthy filter:

```bash
kubectl get pods -n healthcare | grep -E "CrashLoopBackOff|ImagePullBackOff|Error|Pending" || echo "All pods healthy"
```

## 3) Smoke Test Endpoints

Payment health check:

```bash
curl http://localhost:5005/api/v1/payments/health
```

If port 5005 is not reachable from host, check your service list:

```bash
kubectl get svc -n healthcare
```

## 4) Troubleshooting

If any deployment is not ready:

```bash
kubectl get pods -n healthcare
kubectl describe pod <pod-name> -n healthcare
kubectl logs <pod-name> -n healthcare --tail=200
kubectl logs <pod-name> -n healthcare --previous --tail=200
```

If image pull fails:

```bash
docker images | grep healthcare-
kubectl describe pod <pod-name> -n healthcare
```

If port-forward or local port is occupied:

```bash
lsof -i :8004
```

## 5) Stop All Services

Stop Kubernetes resources via deploy script:

```bash
./deploy-k8s.sh delete
```

Type `yes` when prompted.

Verify namespace resources are removed:

```bash
kubectl get all -n healthcare
```

If you also started Docker Compose separately:

```bash
docker compose down
```

## Useful Commands

Show overall status:

```bash
./deploy-k8s.sh status
```

View payment-service logs:

```bash
./deploy-k8s.sh logs
```

Port-forward payment-service:

```bash
./deploy-k8s.sh forward
```

## Security Notes

- Do not commit real Stripe keys or secrets into Dockerfiles, YAML, or source code.
- Use environment variables, Kubernetes Secrets, or a secret manager.
- If keys were exposed, rotate them immediately in Stripe Dashboard.
