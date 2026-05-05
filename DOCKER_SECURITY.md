# Docker Security Best Practices

## Image Security

### 1. Use Minimal Base Images
✅ Current: `python:3.12-slim` and `nginx:alpine`
- Reduces attack surface
- Smaller image size
- Faster deployments
- Fewer vulnerabilities

### 2. Regular Image Updates
```bash
# Update base image to latest
docker pull python:3.12-slim
docker pull nginx:alpine

# Rebuild images
docker-compose build --no-cache
```

### 3. Image Scanning
```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image finance-tracker-backend:latest

# Scan in pipeline (GitHub Actions)
# Configured in .github/workflows/docker.yml
```

### 4. Sign Images
```bash
# Use Docker Content Trust
export DOCKER_CONTENT_TRUST=1
docker push your-registry/finance-tracker-backend:latest
```

## Container Runtime Security

### 1. Run as Non-Root User
✅ Configured: Dockerfile uses `appuser` (UID 1000)
```dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
```

### 2. Read-Only Filesystems
```yaml
# docker-compose.yml
frontend:
  security_opt:
    - no-new-privileges:true
  read_only: true  # Optional - may break some apps
  tmpfs:
    - /tmp
    - /var/cache/nginx
```

### 3. Resource Limits
```yaml
# docker-compose.yml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 4. Capability Dropping
```yaml
backend:
  cap_drop:
    - ALL
  cap_add:
    - NET_BIND_SERVICE
```

## Network Security

### 1. Network Isolation
✅ Configured: Named `finance-network`
```yaml
networks:
  finance-network:
    driver: bridge
```

### 2. Firewall Rules
```bash
# Only expose necessary ports
# 80, 443: Nginx
# 5432: Database (internal only)
# 8000: Backend (internal only)
# 3000: Frontend (internal only)
```

### 3. SSL/TLS Configuration
✅ Nginx configured with:
- TLS 1.2+ only
- Strong cipher suites
- HSTS headers
- Certificate pinning ready

## Secret Management

### 1. Environment Variables
✅ Use `.env` files locally
```bash
# Development
.env          # Never commit

# Production
.env.prod     # Never commit - use secrets manager
```

### 2. Docker Secrets (for Swarm)
```bash
# Create secrets
echo "your-secret-value" | docker secret create db_password -

# Use in compose
secrets:
  db_password:
    external: true
```

### 3. External Secrets Manager
For production, integrate with:
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Cloud Secret Manager**

```bash
# Example: AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/db_password
```

## Logging & Monitoring

### 1. Centralized Logging
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 2. Log Aggregation
```bash
# Example: ELK Stack
docker run -d -p 9200:9200 docker.elastic.co/elasticsearch/elasticsearch:7.14.0
docker run -d -p 5601:5601 docker.elastic.co/kibana/kibana:7.14.0
docker run -d -p 5000:5000/udp docker.elastic.co/beats/filebeat:7.14.0
```

### 3. Security Events
```dockerfile
# Django logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/security.log',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}
```

## Database Security

### 1. Encryption at Rest
```yaml
db:
  environment:
    # PostgreSQL already encrypts
    # For cloud: enable EBS encryption (AWS) or similar
```

### 2. Encryption in Transit
```yaml
backend:
  command: |
    gunicorn finance_tracker.wsgi:application \
    --ssl-version TLSv1_2 \
    --ssl-certfile /path/to/cert.pem \
    --ssl-keyfile /path/to/key.pem
```

### 3. Backup Encryption
```bash
# Encrypt database backup
gpg --encrypt --recipient your-email@example.com backup.sql

# Decrypt when restoring
gpg --decrypt backup.sql.gpg | docker-compose exec -T db psql -U finance_tracker
```

### 4. Connection Security
```python
# Django settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'sslmode': 'require',  # Enforce SSL/TLS
        }
    }
}
```

## Access Control

### 1. Docker Daemon Security
```bash
# Run with limited privileges
sudo usermod -aG docker your-user

# Restrict daemon access
sudo vim /etc/docker/daemon.json
```

### 2. Registry Authentication
```bash
# Create credentials file
~/.docker/config.json

# Login to private registry
docker login your-registry.com
```

### 3. RBAC (Kubernetes)
```yaml
kind: Role
metadata:
  name: finance-tracker
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
```

## Compliance & Auditing

### 1. Image Compliance
- ✅ No hardcoded secrets
- ✅ No unnecessary packages
- ✅ Non-root user
- ✅ Health checks
- ✅ Resource limits

### 2. Container Compliance
```bash
# Runtime security scanning
docker run --rm --cap-drop=ALL \
  --security-opt=no-new-privileges \
  aquasec/appshield check your-image
```

### 3. Audit Logging
```bash
# Enable Docker audit logging
echo '{"audit": true}' | sudo tee /etc/docker/daemon.json

# View audit logs
journalctl CONTAINER_NAME=finance-tracker
```

## Incident Response

### 1. Container Compromise
```bash
# Stop and inspect container
docker-compose stop backend
docker inspect finance-tracker-backend

# Collect logs
docker logs finance-tracker-backend > logs.txt

# Restore from clean image
docker-compose up -d backend
```

### 2. Secret Exposure
```bash
# Rotate credentials immediately
1. Generate new database password
2. Update .env.prod
3. Rebuild and restart containers
4. Verify new credentials work
5. Document incident
```

### 3. Image Tampering
```bash
# Verify image hash
docker inspect --format='{{.RepoDigests}}' finance-tracker-backend

# Re-sign if needed
docker trust inspect finance-tracker-backend
```

## Continuous Security

### 1. Weekly Tasks
- [ ] Check for updated base images
- [ ] Review Docker security advisories
- [ ] Scan images for new vulnerabilities

### 2. Monthly Tasks
- [ ] Rebuild production images
- [ ] Rotate secrets/credentials
- [ ] Review container logs for anomalies
- [ ] Backup database

### 3. Quarterly Tasks
- [ ] Security audit
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Update security policies

## Security Headers (Nginx)

✅ Configured in `nginx-prod.conf`:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self';" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## Further Reading

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Container Security](https://owasp.org/www-project-container-security/)
- [Trivy Vulnerability Scanner](https://github.com/aquasecurity/trivy)
