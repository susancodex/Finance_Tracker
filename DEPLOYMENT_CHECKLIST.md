# Production Deployment Checklist

## Pre-Deployment Verification

### Environment & Secrets ✓
- [ ] `.env.prod` created and all values filled in
- [ ] `SECRET_KEY` is unique and secure (32+ random characters)
- [ ] `DEBUG` is set to `False`
- [ ] `ALLOWED_HOSTS` matches your domain(s)
- [ ] `SENDGRID_API_KEY` is configured
- [ ] Database credentials are strong and unique
- [ ] SSL/TLS certificates obtained and valid (not self-signed)
- [ ] No secrets committed to git repository

### Database Setup ✓
- [ ] PostgreSQL database created and accessible
- [ ] Database user has proper permissions
- [ ] Backup strategy is in place
- [ ] Database replication/failover configured (if needed)
- [ ] Connection string is correct in DATABASE_URL

### Backend Configuration ✓
- [ ] Django settings reviewed for production
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] `CORS_ALLOWED_ORIGINS` points to frontend domain
- [ ] Email configuration verified (SendGrid API key works)
- [ ] Static files will be collected in Nginx
- [ ] Media files storage is configured
- [ ] Logging is configured properly
- [ ] Security middleware is enabled

### Frontend Configuration ✓
- [ ] `VITE_API_URL` points to backend domain
- [ ] Build optimizations enabled
- [ ] API endpoints use correct domain
- [ ] No hardcoded localhost references
- [ ] Console warnings/errors reviewed and fixed

### Infrastructure ✓
- [ ] Docker images built and scanned for vulnerabilities
- [ ] Images pushed to registry (Docker Hub/ECR/GCR)
- [ ] Docker Compose files for production ready
- [ ] Nginx configuration reviewed for security
- [ ] SSL certificates configured in Nginx
- [ ] Nginx upstream servers correctly configured
- [ ] Rate limiting rules appropriate for expected traffic
- [ ] Health checks configured and tested

### Networking & Security ✓
- [ ] Firewall rules configured (only 80/443 exposed)
- [ ] SSH access restricted
- [ ] DDoS protection enabled (if using CDN)
- [ ] CORS properly configured
- [ ] CSRF protection enabled in Django
- [ ] XSS protection headers added
- [ ] SSL/TLS version 1.2+ only
- [ ] Strong cipher suites configured

### Monitoring & Logging ✓
- [ ] Logging aggregation set up (ELK, CloudWatch, etc.)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring set up (APM)
- [ ] Database monitoring configured
- [ ] Disk space monitoring enabled
- [ ] Alert thresholds defined and tested
- [ ] On-call rotation configured

### Backups & Disaster Recovery ✓
- [ ] Automated database backups configured
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] Media files backup strategy
- [ ] Disaster recovery runbook documented
- [ ] RTO/RPO targets defined
- [ ] Backup encryption enabled

## Deployment Steps

### 1. Pre-Flight Checks
```bash
# Verify Docker installation
docker --version
docker-compose --version

# Check system resources
free -h
df -h

# Verify ports are available
sudo lsof -i :80
sudo lsof -i :443
```

### 2. Prepare Production Environment
```bash
# Create production .env
cp .env.prod.example .env.prod
# Edit .env.prod with actual values

# Ensure proper permissions
chmod 600 .env.prod
```

### 3. Build and Test
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run local tests
docker-compose -f docker-compose.prod.yml run backend python manage.py test

# Scan images for vulnerabilities
docker scan finance-tracker-backend:latest
docker scan finance-tracker-frontend:latest
```

### 4. Deploy
```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Verify all services running
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs
```

### 5. Post-Deployment Verification
```bash
# Test health endpoints
curl -I https://yourdomain.com
curl -I https://yourdomain.com/api/auth/login
curl -I https://yourdomain.com/admin

# Test database connectivity
docker-compose -f docker-compose.prod.yml exec backend \
  python -c "from django.db import connection; \
  connection.ensure_connection(); \
  print('Database connected successfully')"

# Check SSL certificate
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Monitoring After Deployment

### First 24 Hours
- [ ] Monitor error logs for any issues
- [ ] Check application performance metrics
- [ ] Verify email functionality (SendGrid)
- [ ] Test user registration and login
- [ ] Verify API endpoints work as expected
- [ ] Check database performance
- [ ] Monitor disk usage growth

### Ongoing
- [ ] Daily review of error logs
- [ ] Weekly performance analysis
- [ ] Monthly security updates
- [ ] Regular backup verification
- [ ] Quarterly disaster recovery drill

## Rollback Plan

If issues occur after deployment:

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Return to previous version
git checkout <previous-tag>

# Redeploy previous version
docker-compose -f docker-compose.prod.yml up -d

# Restore database from backup if needed
# See DOCKER.md for database restore instructions
```

## Performance Tuning

After initial deployment, consider:

1. **Gunicorn Workers**: Adjust based on CPU count
   ```yaml
   gunicorn --workers 4  # 2-4 x CPU cores
   ```

2. **Database Connection Pool**: Use PgBouncer
3. **Redis Caching**: Add for session management
4. **CDN**: Add for static assets
5. **Load Balancer**: Add if multiple backend instances

## Security Hardening

Post-deployment recommendations:

1. Enable Web Application Firewall (WAF)
2. Implement rate limiting per user/IP
3. Set up DDoS protection
4. Regular security scanning
5. Implement intrusion detection
6. Set up log analysis for security events
7. Regular penetration testing
8. Security audit trail logging

## Support & Escalation

**For deployment issues:**
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify DNS: `nslookup yourdomain.com`
3. Check SSL: `openssl s_client -servername yourdomain.com -connect yourdomain.com:443`
4. Database connectivity: Connect and run SELECT 1
5. Contact hosting provider if infrastructure issue

**For application issues:**
1. Check application logs
2. Review recent code changes
3. Check database for errors
4. Verify external service integrations (SendGrid, etc.)
5. Review resource usage (CPU, memory, disk)
