#!/bin/bash

# Docker build script for local development
# Usage: ./scripts/docker-build.sh

set -e

echo "📦 Building Docker images for development..."

# Build backend
echo "🔨 Building backend image..."
docker build -t finance-tracker-backend:dev ./backend

# Build frontend
echo "🔨 Building frontend image..."
docker build -t finance-tracker-frontend:dev ./frontend

echo "✅ Docker images built successfully!"
echo ""
echo "To start the containers, run:"
echo "  docker-compose up -d"
echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f"
