#!/bin/bash

# Stop Docker containers
# Usage: ./scripts/docker-stop.sh

set -e

echo "🛑 Stopping Docker containers..."

docker-compose down

echo "✅ Containers stopped successfully!"
