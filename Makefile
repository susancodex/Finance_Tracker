.PHONY: help docker-build docker-up docker-down docker-logs docker-clean rebuild migrate shell superuser test coverage lint format

help:
	@echo "Finance Tracker - Docker Management Commands"
	@echo ""
	@echo "Development:"
	@echo "  make docker-build    - Build Docker images"
	@echo "  make docker-up       - Start containers"
	@echo "  make docker-down     - Stop containers"
	@echo "  make docker-logs     - View container logs"
	@echo "  make docker-clean    - Remove containers and volumes"
	@echo "  make rebuild         - Rebuild and restart containers"
	@echo ""
	@echo "Database:"
	@echo "  make migrate         - Run Django migrations"
	@echo "  make makemigrations  - Create new migrations"
	@echo "  make superuser       - Create Django superuser"
	@echo "  make shell           - Access Django shell"
	@echo ""
	@echo "Utilities:"
	@echo "  make test            - Run tests"
	@echo "  make lint            - Run linting"
	@echo "  make format          - Format code"
	@echo "  make db-backup       - Backup database"
	@echo "  make db-restore      - Restore database"

# Docker Commands
docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting containers..."
	docker-compose up -d
	@echo "✅ Containers started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"

docker-down:
	@echo "Stopping containers..."
	docker-compose down
	@echo "✅ Containers stopped!"

docker-logs:
	docker-compose logs -f

docker-logs-backend:
	docker-compose logs -f backend

docker-logs-frontend:
	docker-compose logs -f frontend

docker-logs-db:
	docker-compose logs -f db

docker-clean:
	@echo "Removing containers, networks, and volumes..."
	docker-compose down -v
	@echo "✅ Cleaned up!"

rebuild: docker-down docker-build docker-up
	@echo "✅ Containers rebuilt!"

ps:
	docker-compose ps

# Database Commands
migrate:
	@echo "Running migrations..."
	docker-compose exec backend python manage.py migrate --run-syncdb
	@echo "✅ Migrations complete!"

makemigrations:
	@echo "Creating migrations..."
	docker-compose exec backend python manage.py makemigrations

superuser:
	@echo "Creating superuser..."
	docker-compose exec backend python manage.py createsuperuser

shell:
	docker-compose exec backend python manage.py shell

bash-backend:
	docker-compose exec backend bash

bash-frontend:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec db psql -U finance_tracker -d finance_tracker

# Backup & Restore
db-backup:
	@echo "Creating database backup..."
	docker-compose exec -T db pg_dump -U finance_tracker finance_tracker > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created!"

db-restore:
	@read -p "Enter backup file path: " backup_file; \
	docker-compose exec -T db psql -U finance_tracker finance_tracker < $$backup_file; \
	echo "✅ Database restored!"

# Testing & Quality
test:
	@echo "Running tests..."
	docker-compose exec backend python manage.py test

test-coverage:
	@echo "Running tests with coverage..."
	docker-compose exec backend coverage run --source='.' manage.py test
	docker-compose exec backend coverage report
	docker-compose exec backend coverage html
	@echo "✅ Coverage report generated in htmlcov/"

lint:
	@echo "Running linters..."
	docker-compose exec backend flake8 .
	docker-compose exec backend black --check .

format:
	@echo "Formatting code..."
	docker-compose exec backend black .
	docker-compose exec backend isort .

# Production
prod-build:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build

prod-up:
	@echo "Starting production containers..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production containers started!"

prod-down:
	@echo "Stopping production containers..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Utility
check-ports:
	@echo "Checking if ports are available..."
	@echo "Port 3000 (Frontend):"
	@lsof -i :3000 || echo "  ✅ Available"
	@echo "Port 8000 (Backend):"
	@lsof -i :8000 || echo "  ✅ Available"
	@echo "Port 5432 (Database):"
	@lsof -i :5432 || echo "  ✅ Available"

env-check:
	@if [ -f .env ]; then \
		echo "✅ .env file exists"; \
	else \
		echo "⚠️  .env file not found. Creating from .env.example..."; \
		cp .env.example .env; \
	fi

version:
	@echo "Docker version:"
	@docker --version
	@echo "Docker Compose version:"
	@docker-compose --version
