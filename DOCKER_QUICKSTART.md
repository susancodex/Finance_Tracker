# Docker Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Port 3000, 5432, 8000 available

### Start Development

```bash
# 1. Clone/update environment
cp .env.example .env

# 2. Make scripts executable
chmod +x scripts/docker-*.sh

# 3. Start everything
make docker-up

# 4. View logs
make docker-logs
```

### Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin
- Database: localhost:5432

## Common Commands

```bash
# Start/stop containers
make docker-up                  # Start all services
make docker-down                # Stop all services
make docker-logs                # View all logs
make rebuild                    # Rebuild and restart

# Database operations
make migrate                    # Run migrations
make superuser                  # Create admin user
make db-backup                  # Backup database

# Testing
make test                       # Run all tests
make lint                       # Check code quality

# Development
make bash-backend               # Access backend shell
make db-shell                   # Access database
```

## File Structure

```
Finance_Tracker/
├── backend/
│   ├── Dockerfile             # Backend container image
│   └── .dockerignore          # Files to exclude from image
├── frontend/
│   ├── Dockerfile             # Frontend container image
│   ├── nginx.conf             # Nginx web server config
│   ├── nginx-default.conf     # Nginx routing rules
│   └── .dockerignore          # Files to exclude from image
├── docker-compose.yml         # Development compose file
├── docker-compose.prod.yml    # Production compose file
├── nginx-prod.conf            # Production Nginx config
├── Makefile                   # Command shortcuts
├── DOCKER.md                  # Detailed documentation
├── DOCKER_WITH_RENDER.md      # Render + Docker info
├── DOCKER_SECURITY.md         # Security guide
└── scripts/
    ├── docker-build.sh        # Build images
    ├── docker-start.sh        # Start containers
    ├── docker-stop.sh         # Stop containers
    └── docker-rebuild.sh      # Rebuild from scratch
```

## Troubleshooting

### Port already in use
```bash
make docker-down                # Stop current containers
make check-ports                # Check which ports are free
```

### Database connection error
```bash
make docker-logs-db             # Check database logs
docker-compose ps               # Verify containers running
```

### Build failure
```bash
docker-compose build --no-cache # Rebuild without cache
docker-compose logs backend     # Check build logs
```

### Clean slate
```bash
make docker-clean               # Remove everything
make docker-build               # Start fresh
make docker-up                  # Run new containers
```

## Next Steps

- Read [DOCKER.md](DOCKER.md) for detailed documentation
- Review [DOCKER_SECURITY.md](DOCKER_SECURITY.md) for security
- Check [DOCKER_WITH_RENDER.md](DOCKER_WITH_RENDER.md) for Render integration
- Explore [Makefile](Makefile) for all available commands

## Important Notes

✅ **Your Render deployment is safe!**
- New Docker files don't affect existing Render deployment
- `render.yaml` remains unchanged
- Continue pushing to GitHub normally
- Render auto-deploys as before

📝 **Environment Variables**
- `.env` for local development (git-ignored)
- `.env.prod.example` for production template
- Never commit `.env.prod` with real secrets

🔒 **Security**
- Docker images built with security best practices
- Non-root user execution
- Health checks configured
- Security headers included

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Read detailed docs: See [DOCKER.md](DOCKER.md)
3. Review examples: Check `docker-compose.yml`
4. Test individually: `docker-compose up db` (just database)

Happy coding! 🎉
