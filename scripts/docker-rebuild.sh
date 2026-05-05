#!/bin/bash

# Rebuild Docker containers and restart
# Usage: ./scripts/docker-rebuild.sh

set -e

echo "🔄 Rebuilding Docker containers..."

docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Containers rebuilt and started!"
echo ""
echo "📊 Application URLs:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo ""
echo "📝 To view logs:"
echo "  docker-compose logs -f"
