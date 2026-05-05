#!/bin/bash

# Docker production build script
# Usage: ./scripts/docker-build-prod.sh

set -e

echo "📦 Building Docker images for production..."

# Build backend
echo "🔨 Building backend image..."
docker build -t finance-tracker-backend:latest ./backend

# Build frontend
echo "🔨 Building frontend image..."
docker build -t finance-tracker-frontend:latest ./frontend

echo "✅ Docker images built successfully!"
echo ""
echo "To start containers with production compose, run:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "To push to registry (if using Docker Hub/ECR):"
echo "  docker tag finance-tracker-backend:latest your-registry/finance-tracker-backend:latest"
echo "  docker push your-registry/finance-tracker-backend:latest"
echo "  docker tag finance-tracker-frontend:latest your-registry/finance-tracker-frontend:latest"
echo "  docker push your-registry/finance-tracker-frontend:latest"
