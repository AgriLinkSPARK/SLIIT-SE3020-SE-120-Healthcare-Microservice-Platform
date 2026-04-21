#!/bin/bash

# Healthcare Payment Service Docker Compose Deployment Script
# Usage: ./deploy-docker.sh [action]
# Actions: up, down, restart, logs, build, clean, status

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME=${PROJECT_NAME:-healthcare}
ACTION=${1:-up}

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
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

create_env_file() {
    print_info "Creating .env file if it doesn't exist..."
    
    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# Stripe Configuration
STRIPE_API_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Optional Atlas URIs (leave blank for local MongoDB)
PAYMENT_SPRING_MONGODB_URI_ATLAS=
APPOINTMENT_SPRING_MONGODB_URI_ATLAS=
DOCTOR_MONGODB_URI_ATLAS=

# Auth Service Configuration
AUTH_MONGODB_URI=mongodb://mongodb:27017/auth_service
AUTH_SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/auth_service
AUTH_SPRING_MONGODB_URI=mongodb://mongodb:27017/auth_service
AUTH_JWT_SECRET=replace-with-a-strong-secret
AUTH_JWT_EXPIRATION_MINUTES=120
AUTH_SEED_ADMIN_ENABLED=true
AUTH_ADMIN_FULL_NAME=Platform Administrator
AUTH_ADMIN_EMAIL=admin@healthcare.local
AUTH_ADMIN_PASSWORD=replace-with-strong-password

# Doctor Service
DOCTOR_JWT_SECRET=replace-with-a-strong-secret

# Telemedicine + Jitsi
TELEMEDICINE_JWT_SECRET=replace-with-a-strong-secret
JITSI_API_URL=https://api.jitsi.net
JITSI_API_KEY=replace-with-jitsi-api-key
JITSI_APP_ID=replace-with-jitsi-app-id
JITSI_PRIVATE_KEY=replace-with-private-key
JITSI_PUBLIC_KEY=replace-with-public-key
JITSI_CONFERENCE_DURATION=3600

# Frontend
VITE_API_GATEWAY_URL=http://localhost:8081/api
VITE_DOCTOR_SERVICE_URL=http://localhost:8083
VITE_PAYMENT_SERVICE_URL=http://localhost:8004
VITE_APPOINTMENT_SERVICE_URL=http://localhost:8002/api/v1/appointments
VITE_TELEMEDICINE_SERVICE_URL=/api/telemedicine/sessions

# Application Configuration
JAVA_OPTS=-Xmx512m -Xms256m
EOF
        print_warning "Created .env file with default values"
        print_warning "Please update .env with your actual Stripe keys!"
    else
        print_success ".env file exists"
    fi
}

build_images() {
    print_info "Building Docker images..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME build
    
    print_success "Images built successfully"
}

start_services() {
    print_info "Starting Docker services..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME up -d
    
    print_info "Waiting for services to be ready..."
    sleep 5
    
    print_info "Services status:"
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps
    
    print_success "Services started"
}

verify_services() {
    print_info "Verifying services..."
    
    # Check MongoDB
    print_info "Checking MongoDB..."
    if docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME exec -T mongodb mongosh -u admin -p admin123 --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB is running"
    else
        print_warning "MongoDB check may have failed"
    fi
    
    # Check Payment Service
    print_info "Checking Payment Service..."
    if curl -s http://localhost:8004/api/v1/payments/health | grep -q "UP"; then
        print_success "Payment Service is running"
    else
        print_warning "Payment Service check failed"
    fi
    
    print_success "Services verified"
}

show_logs() {
    print_info "Showing logs (press Ctrl+C to exit)..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME logs -f
}

show_service_logs() {
    SERVICE=$1
    if [ -z "$SERVICE" ]; then
        print_error "Service name required"
        exit 1
    fi
    
    print_info "Showing logs for $SERVICE (press Ctrl+C to exit)..."
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME logs -f $SERVICE
}

stop_services() {
    print_info "Stopping Docker services..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME down
    
    print_success "Services stopped"
}

restart_services() {
    print_info "Restarting Docker services..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME restart
    
    sleep 3
    print_success "Services restarted"
}

clean_resources() {
    print_warning "Cleaning up Docker resources (containers, volumes)..."
    
    read -p "Are you sure? This will delete all data. (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME down -v
        print_success "Resources cleaned"
    else
        print_warning "Clean cancelled"
    fi
}

show_status() {
    print_info "Service Status"
    
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps
    
    print_info "Docker Networks"
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps --services
    
    print_info "Container Resource Usage"
    docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
}

show_endpoints() {
    print_info "Service Endpoints"
    
    echo -e "${BLUE}Backend API:${NC}"
    echo "  http://localhost:8004/api/v1"
    
    echo -e "\n${BLUE}Health Checks:${NC}"
    echo "  Payment Service: http://localhost:8004/api/v1/payments/health"
    echo "  MongoDB: localhost:27017"
    
    echo -e "\n${BLUE}Test Commands:${NC}"
    echo "  curl http://localhost:8004/api/v1/payments/health"
    echo "  mongosh --host localhost -u admin -p admin123"
}

execute_command() {
    SERVICE=$1
    COMMAND=$2
    
    if [ -z "$SERVICE" ] || [ -z "$COMMAND" ]; then
        print_error "Usage: $0 exec <service> <command>"
        exit 1
    fi
    
    print_info "Executing command in $SERVICE..."
    docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME exec $SERVICE $COMMAND
}

view_metrics() {
    print_info "Docker Container Metrics"
    
    docker stats --no-stream --format "table {{.Container}}\t{{.Image}}\t{{.Status}}\t{{.MemUsage}}\t{{.CPUPerc}}"
}

# Main execution
main() {
    print_info "Healthcare Payment Service Docker Compose Deployment"
    print_info "====================================================="
    print_info "Action: $ACTION"
    print_info "Project: $PROJECT_NAME"
    
    check_prerequisites
    
    case $ACTION in
        up)
            create_env_file
            build_images
            start_services
            verify_services
            show_endpoints
            print_success "Deployment complete!"
            print_info "Frontend: http://localhost:3000"
            print_info "Backend: http://localhost:8004/api/v1"
            print_info "MongoDB: localhost:27017 (username: admin, password: admin123)"
            ;;
        down)
            stop_services
            ;;
        restart)
            restart_services
            verify_services
            ;;
        logs)
            show_logs
            ;;
        logs-service)
            SERVICE=$2
            show_service_logs $SERVICE
            ;;
        build)
            build_images
            ;;
        clean)
            clean_resources
            ;;
        status)
            show_status
            ;;
        endpoints)
            show_endpoints
            ;;
        metrics)
            view_metrics
            ;;
        exec)
            SERVICE=$2
            COMMAND=$3
            execute_command $SERVICE $COMMAND
            ;;
        *)
            print_error "Unknown action: $ACTION"
            echo -e "\n${BLUE}Available actions:${NC}"
            echo "  up                - Start all services"
            echo "  down              - Stop all services"
            echo "  restart           - Restart services"
            echo "  logs              - Show logs from all services"
            echo "  logs-service <svc>- Show logs from specific service"
            echo "  build             - Build Docker images"
            echo "  clean             - Clean up containers and volumes"
            echo "  status            - Show services status"
            echo "  endpoints         - Show service endpoints"
            echo "  metrics           - Show container metrics"
            echo "  exec <svc> <cmd>  - Execute command in service"
            exit 1
    esac
}

# Execute main function
main "$@"
