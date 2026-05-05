# Docker Setup Guide for Finance Tracker

## Overview

This project includes production-ready Docker configuration with:
- Multi-stage builds for optimized image sizes
- Docker Compose for local development
- Production-grade security configurations
- Health checks and auto-restart policies
- Nginx reverse proxy with SSL/TLS support
- Rate limiting and security headers

## Prerequisites

- Docker Desktop (includes Docker and Docker Compose)
- 4GB RAM minimum (8GB recommended)
- Ports available: 3000, 8000, 5432, 80, 443

## Quick Start - Local Development

### 1. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your local settings
```

### 2. Make scripts executable

```bash
chmod +x scripts/docker-*.sh
```

### 3. Start the Project

```bash
./scripts/docker-start.sh
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Database**: localhost:5432

## Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Run Database Migrations

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py makemigrations
```

### Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Access Database Shell

```bash
docker-compose exec db psql -U finance_tracker -d finance_tracker
```

### Shell into Container

```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh
```

### Rebuild Containers

```bash
./scripts/docker-rebuild.sh
```

### Stop All Containers

```bash
./scripts/docker-stop.sh
```

### Clean Up Everything

```bash
# Remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Deployment

### 1. Prepare Environment

```bash
cp .env.prod.example .env.prod
# Edit .env.prod with production values
```

**Important**: Never commit `.env.prod` to version control.

### 2. Build Production Images

```bash
./scripts/docker-build-prod.sh
```

### 3. Set Up SSL/TLS Certificates

Place your SSL certificates in a directory and update `docker-compose.prod.yml`:

```yaml
volumes:
  - /path/to/certs:/etc/nginx/certs:ro
```

Or use Let's Encrypt with Certbot:

```bash
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com
```

### 4. Start Production Stack

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 5. Verify Deployment

```bash
# Check services are running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health
curl -I https://yourdomain.com
```

## Database Backup & Recovery

### Create Backup

```bash
docker-compose exec -T db pg_dump -U finance_tracker finance_tracker > backup.sql
```

### Restore Backup

```bash
docker-compose exec -T db psql -U finance_tracker finance_tracker < backup.sql
```

## Performance Optimization

### 1. Resource Limits

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. Database Connection Pooling

Consider using PgBouncer for production:

```yaml
pgbouncer:
  image: pgbouncer:latest
  environment:
    DATABASES_HOST: db
    DATABASES_PORT: 5432
    DATABASES_USER: finance_tracker
    DATABASES_PASSWORD: ${DB_PASSWORD}
    DATABASES_DBNAME: finance_tracker
```

### 3. Caching

Implement Redis caching:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check database container
docker-compose logs db

# Test connection
docker-compose exec backend python -c "from django.db import connection; connection.ensure_connection(); print('DB OK')"
```

### Image Build Failures

```bash
# Clean and rebuild
docker-compose build --no-cache
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service>

# Rebuild specific service
docker-compose build --no-cache <service>
```

## Security Best Practices

1. **Environment Variables**: Keep `.env.prod` secret, use Docker secrets in Swarm mode
2. **Image Scanning**: Regularly scan images for vulnerabilities
   ```bash
   docker scan finance-tracker-backend:latest
   ```
3. **Keep Images Updated**: Rebuild periodically
4. **Network Isolation**: Use named networks (already configured)
5. **Read-only Filesystems**: Consider for frontend container
6. **Resource Limits**: Set CPU/memory constraints

## Monitoring & Logging

### Check Container Health

```bash
docker-compose ps
```

### View Real-time Metrics

```bash
docker stats
```

### Centralized Logging

```bash
# View combined logs with timestamps
docker-compose logs --timestamps -f
```

## Docker Registry (Docker Hub)

### Tag Images

```bash
docker tag finance-tracker-backend:latest yourusername/finance-tracker-backend:latest
docker tag finance-tracker-frontend:latest yourusername/finance-tracker-frontend:latest
```

### Push to Registry

```bash
docker login
docker push yourusername/finance-tracker-backend:latest
docker push yourusername/finance-tracker-frontend:latest
```

### Pull and Run from Registry

```bash
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  yourusername/finance-tracker-backend:latest
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Python Docker Images](https://docs.docker.com/language/python/build-images/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

For issues or questions, please check the troubleshooting section or refer to the main README.md.
