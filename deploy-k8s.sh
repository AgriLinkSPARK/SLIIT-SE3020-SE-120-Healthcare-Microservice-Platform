#!/bin/bash

# Healthcare Platform Kubernetes Deployment Script
# Usage: ./deploy-k8s.sh [action] [environment]
# Actions: deploy, update, delete, rollback, status
# Environments: dev, staging, production

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-healthcare}
IMAGE_REGISTRY=${IMAGE_REGISTRY:-}
IMAGE_TAG=${IMAGE_TAG:-1.0.0}
ACTION=${1:-deploy}
ENVIRONMENT=${2:-dev}

SERVICE_BUILD_CONFIGS=(
    "healthcare-payment-service|services/payment-service"
    "healthcare-auth-service|services/auth-service"
    "healthcare-appointment-service|services/appointment-service"
    "healthcare-doctor-service|services/doctor-service"
    "healthcare-patient-service|services/patient-service"
    "healthcare-notification-service|services/notification-service"
    "healthcare-telemedicine-service|services/telemedicine-service"
    "healthcare-frontend|frontend"
    "healthcare-api-gateway|api-gateway"
)

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Kubernetes cluster is not accessible"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

create_namespace() {
    print_info "Creating/verifying namespace: $NAMESPACE"
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        print_warning "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace $NAMESPACE
        kubectl label namespace $NAMESPACE managed-by=platform
        print_success "Namespace created"
    fi
}

build_and_push_image() {
    print_info "Building Docker images for all services..."

    for config in "${SERVICE_BUILD_CONFIGS[@]}"; do
        IFS='|' read -r image_name build_context <<< "$config"
        if [ -n "$IMAGE_REGISTRY" ]; then
            image_ref="${IMAGE_REGISTRY}/${image_name}:${IMAGE_TAG}"
        else
            image_ref="${image_name}:${IMAGE_TAG}"
        fi

        if [ "$image_name" = "healthcare-frontend" ]; then
            print_info "Building $image_ref with frontend build args"
            docker build -t "$image_ref" \
                --build-arg VITE_API_GATEWAY_URL=http://localhost:5006 \
                --build-arg VITE_DOCTOR_SERVICE_URL=http://localhost:5000 \
                --build-arg VITE_PAYMENT_SERVICE_URL=http://localhost:5005 \
                --build-arg VITE_APPOINTMENT_SERVICE_URL=http://localhost:5003 \
                --build-arg VITE_TELEMEDICINE_SERVICE_URL=http://localhost:5004 \
                --build-arg VITE_STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}" \
                "$build_context"
        else
            print_info "Building $image_ref"
            docker build -t "$image_ref" "$build_context"
        fi

        if [ "$ENVIRONMENT" != "dev" ] && [ -n "$IMAGE_REGISTRY" ]; then
            print_info "Pushing image $image_ref"
            docker push "$image_ref"
        fi
    done

    if [ "$ENVIRONMENT" != "dev" ] && [ -z "$IMAGE_REGISTRY" ]; then
        print_warning "IMAGE_REGISTRY is empty. Skipping push and using local images."
    fi

    print_success "All images built successfully"
}

load_environment_config() {
    print_info "Loading environment configuration for: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        dev)
            STRIPE_API_KEY=${STRIPE_API_KEY:-sk_test_dev}
            STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-pk_test_dev}
            STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-whsec_dev}
            REPLICAS=1
            ;;
        staging)
            STRIPE_API_KEY=${STRIPE_API_KEY:-sk_test_staging}
            STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-pk_test_staging}
            STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-whsec_staging}
            REPLICAS=2
            ;;
        production)
            STRIPE_API_KEY=${STRIPE_API_KEY:-sk_live_prod}
            STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-pk_live_prod}
            STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-whsec_prod}
            REPLICAS=3
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
    esac
    
    print_success "Environment configuration loaded"
}

create_secrets() {
    print_info "Creating/updating Stripe secrets..."
    
    if kubectl get secret stripe-secrets -n $NAMESPACE &> /dev/null; then
        print_warning "Stripe secret already exists, updating..."
        kubectl delete secret stripe-secrets -n $NAMESPACE
    fi
    
    kubectl create secret generic stripe-secrets \
        --from-literal=api-key="$STRIPE_API_KEY" \
        --from-literal=publishable-key="$STRIPE_PUBLISHABLE_KEY" \
        --from-literal=webhook-secret="$STRIPE_WEBHOOK_SECRET" \
        -n $NAMESPACE
    
    print_success "Secrets created"
}

deploy_manifests() {
    print_info "Deploying Kubernetes manifests..."
    
    # Apply ConfigMaps and Secrets
    kubectl apply -f k8s/configmap-secrets.yaml
    
    # Apply MongoDB
    kubectl apply -f k8s/mongodb-deployment.yaml
    
    # Wait for MongoDB to be ready
    print_info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod \
        -l app=mongodb \
        -n $NAMESPACE \
        --timeout=300s || true
    
    # Apply Payment Service and all additional services
    kubectl apply -f k8s/payment-service-deployment.yaml
    kubectl apply -f k8s/additional-services.yaml

    # Ensure deployments use images built by this script.
    if [ -n "$IMAGE_REGISTRY" ]; then
        IMAGE_PREFIX="${IMAGE_REGISTRY}/"
    else
        IMAGE_PREFIX=""
    fi

    kubectl set image deployment/payment-service \
        payment-service=${IMAGE_PREFIX}healthcare-payment-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/auth-service \
        auth-service=${IMAGE_PREFIX}healthcare-auth-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/appointment-service \
        appointment-service=${IMAGE_PREFIX}healthcare-appointment-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/doctor-service \
        doctor-service=${IMAGE_PREFIX}healthcare-doctor-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/patient-service \
        patient-service=${IMAGE_PREFIX}healthcare-patient-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/notification-service \
        notification-service=${IMAGE_PREFIX}healthcare-notification-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/telemedicine-service \
        telemedicine-service=${IMAGE_PREFIX}healthcare-telemedicine-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/frontend \
        frontend=${IMAGE_PREFIX}healthcare-frontend:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/api-gateway \
        api-gateway=${IMAGE_PREFIX}healthcare-api-gateway:${IMAGE_TAG} \
        -n $NAMESPACE
    
    # Update replicas if needed
    kubectl scale deployment payment-service --replicas=$REPLICAS -n $NAMESPACE
    
    # Wait for deployments to be ready
    print_info "Waiting for all deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/payment-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/auth-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/appointment-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/doctor-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/patient-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/notification-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/telemedicine-service -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n $NAMESPACE || true
    
    print_success "Manifests deployed"
}

deploy_ingress() {
    print_info "Deploying Ingress configuration..."
    
    if [ "$ENVIRONMENT" != "dev" ]; then
        kubectl apply -f k8s/ingress.yaml
        print_success "Ingress deployed"
    else
        print_warning "Skipping ingress for dev environment"
    fi
}

verify_deployment() {
    print_info "Verifying deployment..."
    
    print_info "Checking pods..."
    kubectl get pods -n $NAMESPACE
    
    print_info "Checking services..."
    kubectl get svc -n $NAMESPACE
    
    print_info "Checking deployments..."
    kubectl get deployments -n $NAMESPACE
    
    print_success "Deployment verified"
}

delete_deployment() {
    print_warning "Deleting deployment from namespace: $NAMESPACE"
    
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        kubectl delete -f k8s/ingress.yaml -n $NAMESPACE || true
        kubectl delete -f k8s/additional-services.yaml -n $NAMESPACE || true
        kubectl delete -f k8s/payment-service-deployment.yaml -n $NAMESPACE || true
        kubectl delete -f k8s/mongodb-deployment.yaml -n $NAMESPACE || true
        print_success "Deployment deleted"
    else
        print_warning "Delete cancelled"
    fi
}

update_deployment() {
    print_info "Updating deployment..."

    if [ -n "$IMAGE_REGISTRY" ]; then
        IMAGE_PREFIX="${IMAGE_REGISTRY}/"
    else
        IMAGE_PREFIX=""
    fi
    
    # Set new image
    kubectl set image deployment/payment-service \
        payment-service=${IMAGE_PREFIX}healthcare-payment-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/auth-service \
        auth-service=${IMAGE_PREFIX}healthcare-auth-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/appointment-service \
        appointment-service=${IMAGE_PREFIX}healthcare-appointment-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/doctor-service \
        doctor-service=${IMAGE_PREFIX}healthcare-doctor-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/patient-service \
        patient-service=${IMAGE_PREFIX}healthcare-patient-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/notification-service \
        notification-service=${IMAGE_PREFIX}healthcare-notification-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/telemedicine-service \
        telemedicine-service=${IMAGE_PREFIX}healthcare-telemedicine-service:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/frontend \
        frontend=${IMAGE_PREFIX}healthcare-frontend:${IMAGE_TAG} \
        -n $NAMESPACE
    kubectl set image deployment/api-gateway \
        api-gateway=${IMAGE_PREFIX}healthcare-api-gateway:${IMAGE_TAG} \
        -n $NAMESPACE
    
    # Wait for rollouts
    kubectl rollout status deployment/payment-service -n $NAMESPACE
    kubectl rollout status deployment/auth-service -n $NAMESPACE
    kubectl rollout status deployment/appointment-service -n $NAMESPACE
    kubectl rollout status deployment/doctor-service -n $NAMESPACE
    kubectl rollout status deployment/patient-service -n $NAMESPACE
    kubectl rollout status deployment/notification-service -n $NAMESPACE
    kubectl rollout status deployment/telemedicine-service -n $NAMESPACE
    kubectl rollout status deployment/frontend -n $NAMESPACE
    kubectl rollout status deployment/api-gateway -n $NAMESPACE
    
    print_success "Deployment updated"
}

rollback_deployment() {
    print_info "Rolling back deployment..."
    
    kubectl rollout undo deployment/payment-service -n $NAMESPACE
    kubectl rollout status deployment/payment-service -n $NAMESPACE
    
    print_success "Deployment rolled back"
}

show_status() {
    print_info "Deployment Status for $NAMESPACE"
    
    echo -e "\n${BLUE}=== Pods ===${NC}"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n${BLUE}=== Services ===${NC}"
    kubectl get svc -n $NAMESPACE
    
    echo -e "\n${BLUE}=== Deployments ===${NC}"
    kubectl get deployments -n $NAMESPACE
    
    echo -e "\n${BLUE}=== HPA ===${NC}"
    kubectl get hpa -n $NAMESPACE || true
    
    echo -e "\n${BLUE}=== Recent Events ===${NC}"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
}

show_logs() {
    print_info "Showing logs for Payment Service"
    
    POD=$(kubectl get pods -n $NAMESPACE -l app=payment-service -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POD" ]; then
        print_error "No pods found"
        exit 1
    fi
    
    kubectl logs -f $POD -n $NAMESPACE
}

port_forward() {
    print_info "Setting up port forwarding..."
    
    kubectl port-forward -n $NAMESPACE svc/payment-service 8004:80
}

# Main execution
main() {
    print_info "Healthcare Platform Kubernetes Deployment"
    print_info "================================================"
    print_info "Action: $ACTION"
    print_info "Environment: $ENVIRONMENT"
    print_info "Namespace: $NAMESPACE"
    
    check_prerequisites
    create_namespace
    
    case $ACTION in
        deploy)
            build_and_push_image
            load_environment_config
            create_secrets
            deploy_manifests
            deploy_ingress
            verify_deployment
            print_success "Deployment complete!"
            ;;
        update)
            load_environment_config
            build_and_push_image
            update_deployment
            print_success "Update complete!"
            ;;
        delete)
            delete_deployment
            ;;
        rollback)
            rollback_deployment
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        forward)
            port_forward
            ;;
        *)
            print_error "Unknown action: $ACTION"
            echo "Usage: $0 [deploy|update|delete|rollback|status|logs|forward] [dev|staging|production]"
            exit 1
    esac
}

# Execute main function
main "$@"
