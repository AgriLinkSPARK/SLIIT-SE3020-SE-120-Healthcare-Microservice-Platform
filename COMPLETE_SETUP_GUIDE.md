# Complete Healthcare Payment Service Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting Stripe API Keys](#getting-stripe-api-keys)
3. [Local Development Setup](#local-development-setup)
4. [Docker Setup](#docker-setup)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Health Checks](#health-checks)
8. [Common Issues & Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Hardware:**
- CPU: 2+ cores
- RAM: 4GB minimum (8GB recommended)
- Storage: 10GB available

**Software (All Platforms):**
- Java 17 or higher
- Maven 3.8+
- MongoDB 5.0+
- Git

**Platform-Specific:**

**macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java 17
brew install openjdk@17
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install Maven
brew install maven

# Verify installations
java -version
mvn --version

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Java 17
sudo apt-get install -y openjdk-17-jdk

# Install Maven
sudo apt-get install -y maven

# Verify installations
java -version
mvn --version

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
```powershell
# Install Chocolatey (Run PowerShell as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Java 17
choco install openjdk17

# Install Maven
choco install maven

# Install MongoDB
choco install mongodb

# Verify installations
java -version
mvn --version

# Verify MongoDB
mongod --version
# Start MongoDB
net start MongoDB
```

### Docker & Kubernetes Prerequisites

**Docker Installation:**

**macOS:**
```bash
brew install docker docker-compose
brew install --cask docker
# Open Docker Desktop from Applications
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Restart terminal or run: exec sg docker newgrp
```

**Windows:**
```powershell
choco install docker-desktop
# Restart system after installation
```

**Kubernetes Installation:**

**macOS:**
```bash
# Option 1: Using Docker Desktop (Easiest)
# Open Docker Desktop > Settings > Kubernetes > Enable Kubernetes

# Option 2: Using Minikube
brew install minikube
minikube start
minikube kubectl -- cluster-info
```

**Ubuntu/Debian:**
```bash
# Install Minikube
curl -minikube-latest.x86_64.rpm -o minikube.rpm
sudo rpm -Uvh minikube.rpm

# Start Minikube
minikube start
minikube kubectl -- cluster-info
```

**Windows:**
```powershell
# Install Minikube
choco install minikube

# Start Minikube
minikube start

# Verify
minikube kubectl -- cluster-info
```

---

## Getting Stripe API Keys

### Step 1: Create Stripe Account

1. Visit [Stripe Sign Up](https://dashboard.stripe.com/register)
2. Fill in your email, password
3. Enter your business information
4. Verify your email address
5. Complete your profile setup

### Step 2: Access API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Developers** in the left sidebar
3. Select **API Keys**
4. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` for sandbox)
   - **Secret Key** (starts with `sk_test_` for sandbox)

### Step 3: Get Webhook Secret

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://your-domain/api/v1/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click **Create endpoint**
6. Click on the endpoint to view **Signing secret**
7. Copy the signing secret (starts with `whsec_`)

### Step 4: Save Your Keys

Create a file to store these securely (for development only):

```bash
# Create .env file in payment-service directory
cat > services/payment-service/.env << 'EOF'
# Stripe Configuration
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Database Configuration
MONGO_URI=mongodb://localhost:27017/healthcare_payments

# Payment URLs
PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
PAYMENT_FAILURE_URL=http://localhost:3000/payment/failure
EOF
```

### ⚠️ Security Note

**NEVER commit .env files to Git!**

Add to `.gitignore`:
```bash
echo ".env" >> services/payment-service/.gitignore
echo ".env" >> frontend/.gitignore
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/SLIIT-SE3020/SE-120-Healthcare-Microservices-Platform.git
cd SLIIT-SE3020-SE-120-Healthcare-Microservices-Platform
```

### Step 2: Setup Backend

```bash
cd services/payment-service

# Create .env file with Stripe keys (see section above)

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

**Expected Output:**
```
Started PaymentServiceApplication in X seconds
Tomcat started on port(s): 8004
```

**Verify:**
```bash
curl http://localhost:8004/api/v1/payments/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "service": "payment-service"
}
```

### Step 3: Setup MongoDB

```bash
# Start MongoDB (if not running)
# macOS:
brew services start mongodb-community

# Ubuntu:
sudo systemctl start mongod

# Windows: MongoDB should have started automatically

# Verify MongoDB is running
mongosh
> show databases
> exit
```

### Step 4: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Install Stripe libraries
npm install @stripe/react-stripe-js @stripe/stripe-js
npm install axios

# Create .env file
cat > .env << 'EOF'
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
REACT_APP_API_BASE_URL=http://localhost:8004/api/v1
REACT_APP_PAYMENT_SERVICE_URL=http://localhost:8004
EOF

# Start development server
npm start
```

**Expected:**
- Backend: http://localhost:8004/api/v1
- Frontend: http://localhost:3000
- MongoDB: localhost:27017

---

## Docker Setup

### Step 1: Build Docker Images

```bash
# Build Backend Image
cd services/payment-service
docker build -t healthcare-payment-service:1.0.0 .

# Verify image was created
docker images | grep healthcare-payment-service
```

### Step 2: Create Docker Compose File

Create `docker-compose.yml` in root directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: healthcare-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - mongodb_data:/data/db
    networks:
      - healthcare-network

  payment-service:
    image: healthcare-payment-service:1.0.0
    container_name: healthcare-payment-service
    ports:
      - "8004:8004"
    environment:
      STRIPE_API_KEY: ${STRIPE_API_KEY}
      STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      MONGO_URI: mongodb://admin:admin123@mongodb:27017/healthcare_payments?authSource=admin
      PAYMENT_SUCCESS_URL: http://localhost:3000/payment/success
      PAYMENT_FAILURE_URL: http://localhost:3000/payment/failure
      SPRING_PROFILES_ACTIVE: docker
    depends_on:
      - mongodb
    networks:
      - healthcare-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8004/api/v1/payments/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mongodb_data:

networks:
  healthcare-network:
    driver: bridge
```

### Step 3: Create .env for Docker

```bash
# Create .env file in root directory
cat > .env << 'EOF'
# Stripe Configuration
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123

# Application Configuration
JAVA_OPTS=-Xmx512m -Xms256m
EOF
```

### Step 4: Start Docker Services

```bash
# Build and start services
docker-compose up -d

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f payment-service
docker-compose logs -f mongodb

# Test services
curl http://localhost:8004/api/v1/payments/health
mongosh --host localhost -u admin -p admin123
```

### Step 5: Stop Docker Services

```bash
# Stop running containers
docker-compose down

# Remove volumes (data cleanup)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

### Docker Commands Reference

```bash
# List images
docker images

# List containers
docker ps -a

# View container logs
docker logs -f <container_id>

# Execute command in container
docker exec -it <container_id> bash

# Remove image
docker rmi <image_id>

# Remove container
docker rm <container_id>

# Push to registry
docker tag healthcare-payment-service:1.0.0 your-registry/healthcare-payment-service:1.0.0
docker push your-registry/healthcare-payment-service:1.0.0
```

---

## Kubernetes Deployment

### Step 1: Prerequisites

```bash
# Verify Kubernetes is running
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check namespaces
kubectl get namespaces
```

### Step 2: Create Namespace

```bash
# Create healthcare namespace
kubectl create namespace healthcare

# Verify
kubectl get namespaces
```

### Step 3: Create Secrets for Stripe Keys

```bash
# Create Stripe secrets
kubectl create secret generic stripe-secrets \
  --from-literal=api-key=sk_test_your_key_here \
  --from-literal=publishable-key=pk_test_your_key_here \
  --from-literal=webhook-secret=whsec_your_secret_here \
  -n healthcare

# Verify secrets
kubectl describe secret stripe-secrets -n healthcare
```

### Step 4: Create ConfigMap

Create `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: payment-service-config
  namespace: healthcare
data:
  application.yaml: |
    spring:
      application:
        name: payment-service
      data:
        mongodb:
          uri: mongodb://mongodb-service:27017/healthcare_payments
  PAYMENT_SUCCESS_URL: "http://localhost:3000/payment/success"
  PAYMENT_FAILURE_URL: "http://localhost:3000/payment/failure"
```

### Step 5: Deploy MongoDB

Create `k8s/mongodb-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: healthcare
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:5.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: admin
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
        resources:
          requests:
            memory: "512Mi"
            cpu: "256m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: mongodb-data
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
  namespace: healthcare
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
  type: ClusterIP
```

### Step 6: Deploy Payment Service

Create `k8s/payment-service-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  namespace: healthcare
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
      - name: payment-service
        image: healthcare-payment-service:1.0.0
        imagePullPolicy: Never
        ports:
        - containerPort: 8004
        env:
        - name: STRIPE_API_KEY
          valueFrom:
            secretKeyRef:
              name: stripe-secrets
              key: api-key
        - name: STRIPE_PUBLISHABLE_KEY
          valueFrom:
            secretKeyRef:
              name: stripe-secrets
              key: publishable-key
        - name: STRIPE_WEBHOOK_SECRET
          valueFrom:
            secretKeyRef:
              name: stripe-secrets
              key: webhook-secret
        - name: MONGO_URI
          value: "mongodb://admin:admin123@mongodb-service:27017/healthcare_payments?authSource=admin"
        - name: PAYMENT_SUCCESS_URL
          valueFrom:
            configMapKeyRef:
              name: payment-service-config
              key: PAYMENT_SUCCESS_URL
        - name: PAYMENT_FAILURE_URL
          valueFrom:
            configMapKeyRef:
              name: payment-service-config
              key: PAYMENT_FAILURE_URL
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/payments/health
            port: 8004
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/v1/payments/health
            port: 8004
          initialDelaySeconds: 15
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2

---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
  namespace: healthcare
spec:
  selector:
    app: payment-service
  ports:
  - port: 80
    targetPort: 8004
    protocol: TCP
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payment-service-hpa
  namespace: healthcare
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payment-service
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Step 7: Apply Kubernetes Manifests

```bash
# Create MongoDB secret
kubectl create secret generic mongodb-secret \
  --from-literal=password=admin123 \
  -n healthcare

# Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# Deploy Payment Service
kubectl apply -f k8s/payment-service-deployment.yaml

# Check deployments
kubectl get deployments -n healthcare

# Check pods
kubectl get pods -n healthcare

# Check services
kubectl get svc -n healthcare

# Get LoadBalancer IP
kubectl get service payment-service -n healthcare
```

### Step 8: Verify Kubernetes Deployment

```bash
# Check pod logs
kubectl logs -f deployment/payment-service -n healthcare

# Exec into pod
kubectl exec -it <pod-name> -n healthcare -- bash

# Port forward for local testing
kubectl port-forward service/payment-service 8004:80 -n healthcare

# Test API
curl http://localhost:8004/api/v1/payments/health
```

### Step 9: Kubernetes Management Commands

```bash
# Scale deployment
kubectl scale deployment payment-service --replicas=5 -n healthcare

# Update image
kubectl set image deployment/payment-service \
  payment-service=healthcare-payment-service:2.0.0 -n healthcare

# Rollback deployment
kubectl rollout undo deployment/payment-service -n healthcare

# Check rollout history
kubectl rollout history deployment/payment-service -n healthcare

# Delete deployment
kubectl delete deployment payment-service -n healthcare

# Delete service
kubectl delete service payment-service -n healthcare

# Delete namespace (removes all resources)
kubectl delete namespace healthcare
```

---

## Environment Configuration

### Backend Application Configuration

Create `services/payment-service/src/main/resources/application-docker.yaml`:

```yaml
spring:
  application:
    name: payment-service
  data:
    mongodb:
      uri: ${MONGO_URI:mongodb://mongodb:27017/healthcare_payments}
  jpa:
    show-sql: false

server:
  port: 8004
  servlet:
    context-path: /api/v1

stripe:
  api:
    key: ${STRIPE_API_KEY}
  webhook:
    secret: ${STRIPE_WEBHOOK_SECRET}
  publishable-key: ${STRIPE_PUBLISHABLE_KEY}

payment:
  default-currency: USD
  success-redirect-url: ${PAYMENT_SUCCESS_URL:http://localhost:3000/payment/success}
  failure-redirect-url: ${PAYMENT_FAILURE_URL:http://localhost:3000/payment/failure}

logging:
  level:
    root: INFO
    com.sliit.healthcare: DEBUG
```

### Frontend Environment Configuration

`.env` file for React:

```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
REACT_APP_API_BASE_URL=http://localhost:8004/api/v1
REACT_APP_PAYMENT_SERVICE_URL=http://localhost:8004
REACT_APP_ENV=development
```

---

## Health Checks

### Backend Health Check

```bash
# Health endpoint
curl http://localhost:8004/api/v1/payments/health

# Response:
# {
#   "status": "UP",
#   "service": "payment-service"
# }
```

### Database Health Check

```bash
# MongoDB check
mongosh --host localhost -u admin -p admin123 --eval "db.adminCommand('ping')"

# Or with docker
docker exec healthcare-mongodb mongosh -u admin -p admin123 --eval "db.adminCommand('ping')"
```

### Stripe API Check

```bash
# Test Stripe API key
curl https://api.stripe.com/v1/account \
  -H "Authorization: Bearer sk_test_your_key_here"
```

### Kubernetes Health

```bash
# Check pod status
kubectl get pods -n healthcare

# Check pod events
kubectl describe pod <pod-name> -n healthcare

# Check service endpoints
kubectl get endpoints -n healthcare

# Check persistent volume
kubectl get pv -n healthcare
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# macOS/Linux: Find and kill process
lsof -i :8004
kill -9 <PID>

# Windows: Find and kill process
netstat -ano | findstr :8004
taskkill /PID <PID> /F
```

### Issue: MongoDB Connection Failed

```bash
# Check MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data

# Reset MongoDB (development only)
db.dropDatabase()
```

### Issue: Stripe API Key Invalid

```bash
# Verify key format and validity
# Sandbox keys start with:
# sk_test_ (Secret)
# pk_test_ (Publishable)

# Check environment variable
echo $STRIPE_API_KEY
```

### Issue: Docker Container Won't Start

```bash
# Check container logs
docker logs healthcare-payment-service

# Inspect configuration
docker inspect healthcare-payment-service

# Rebuild image
docker build --no-cache -t healthcare-payment-service:1.0.0 .
```

### Issue: Kubernetes Pod CrashLoopBackOff

```bash
# Check pod logs
kubectl logs <pod-name> -n healthcare

# Describe pod for events
kubectl describe pod <pod-name> -n healthcare

# Check resource limits
kubectl top pods -n healthcare
```

---

## Production Deployment Checklist

- [ ] Use production Stripe keys (not sandbox)
- [ ] Configure HTTPS for all endpoints
- [ ] Set up MongoDB replica set for high availability
- [ ] Configure persistent volumes for data
- [ ] Set up ingress controller for routing
- [ ] Enable pod security policies
- [ ] Configure resource limits and requests
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up backup strategy
- [ ] Test disaster recovery
- [ ] Configure DNS records
- [ ] Set up SSL certificates
- [ ] Enable API throttling

---

## Useful Commands Reference

### Maven

```bash
mvn clean install              # Build project
mvn spring-boot:run           # Run application
mvn test                      # Run tests
mvn package                   # Create jar
mvn dependency:tree           # View dependencies
```

### Docker

```bash
docker build -t name:tag .    # Build image
docker run -d -p 8004:8004 name:tag  # Run container
docker ps                     # List containers
docker logs container-id      # View logs
docker stop container-id      # Stop container
docker rm container-id        # Remove container
```

### Kubernetes

```bash
kubectl apply -f file.yaml    # Apply manifest
kubectl delete -f file.yaml   # Delete manifest
kubectl get all               # List all resources
kubectl describe pod <name>   # Pod details
kubectl logs <pod>            # Pod logs
kubectl exec -it <pod> bash   # Access pod
```

### Git

```bash
git clone <repo>              # Clone repository
git add .                     # Stage changes
git commit -m "message"       # Commit changes
git push origin main          # Push to remote
git pull origin main          # Pull from remote
```

---

## Support & Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Spring Boot Documentation:** https://spring.io/projects/spring-boot
- **MongoDB Documentation:** https://docs.mongodb.com
- **Kubernetes Documentation:** https://kubernetes.io/docs
- **Docker Documentation:** https://docs.docker.com

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
