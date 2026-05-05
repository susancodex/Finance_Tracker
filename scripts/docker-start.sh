#!/bin/bash

# Start Docker containers for development
# Usage: ./scripts/docker-start.sh

set -e

echo "🚀 Starting Finance Tracker with Docker Compose..."

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Start containers
docker-compose up -d

echo "✅ Containers started successfully!"
echo ""
echo "📊 Application URLs:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  Admin:     http://localhost:8000/admin"
echo ""
echo "📝 To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 To stop containers:"
echo "  docker-compose down"
