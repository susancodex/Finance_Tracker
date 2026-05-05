# Finance Tracker

A full-stack personal finance management web application built with **React + Vite** (frontend) and **Django REST Framework** (backend). Track income and expenses, manage categories, set monthly budget limits, and work toward financial goals — all from a clean, mobile-friendly interface.

**Author:** Susan Acharya

---

## Features

### Authentication & Security
- **JWT Authentication** — Secure login with access and refresh tokens; silent token refresh on expiry
- **Simple signup** — Register with full name, email, and password; log in immediately with no extra steps
- **Strong password validation** — Minimum 8 characters with Django's built-in password strength checks
- **Secure password hashing** — Passwords are never stored in plain text

### Registration & Login
- Signup form: full name, email, password, confirm password
- Login form: email and password only
- Client-side validation: required fields, 8-character minimum, matching passwords
- Password show/hide toggle
- Clear, field-level error messages from the backend (duplicate email, weak password, etc.)
- Descriptive network-error feedback when the server is unreachable

### Dashboard
- Net balance, total income, total expenses at a glance
- Monthly income vs. expense breakdown
- Top spending categories shown as visual progress bars
- Category count summary

### Transactions
- Add, edit, and delete income or expense transactions
- Filter by type (income / expense) and month
- Search by note/description
- CSV export of filtered results

### Categories
- Create, edit, and delete custom income/expense categories
- Used across transactions, budgets, and dashboard charts

### Budget Limits
- Set a monthly spending cap per expense category
- Live progress bar showing spent vs. limit

### Financial Goals
- Create savings goals with a name, target amount, and optional deadline
- Track saved amount with an animated progress bar
- Countdown shows days remaining (turns orange/red near deadline)
- Quick **Add Savings** button with preset amount chips (+$10, +$25, +$50…)
- Auto-marks goal as Completed when savings reach the target
- Status: Active, Completed, or Cancelled

### Profile
- Edit full name and phone number
- Upload a profile picture
- Change password from within the app

### Mobile-First UI
- Bottom tab navigation (5 core items)
- Full sidebar navigation on desktop (all 6 sections)
- Bottom-sheet modals on mobile, centered modals on desktop
- Toast notifications for all create / edit / delete actions
- Safe-area padding for notched phones (iOS)

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| Tailwind CSS | Utility-first styling |

### Backend
| Tool | Purpose |
|------|---------|
| Django 6 | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT authentication |
| django-cors-headers | CORS handling |
| Pillow | Profile image processing |
| Gunicorn | WSGI server (production) |
| SQLite | Database (development) |
| PostgreSQL | Database (production / Render) |

### DevOps & Containerization
| Tool | Purpose |
|------|---------|
| Docker | Container runtime |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy & static file server |
| GitHub Actions | CI/CD pipeline |
├── src/
│   │   ├── api/
│   │   │   └── axios.js                # Axios instance with JWT interceptors
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx         # Auth state (login, logout, register, user)
│   │   │   └── ToastContext.jsx        # Global toast notification system
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx           # Sidebar + top bar + mobile bottom nav
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Email + password login
│   │   │   ├── Register.jsx            # Full name, email, password signup
│   │   │   ├── Dashboard.jsx           # Overview & stats
│   │   │   ├── Transactions.jsx        # Income & expense log
│   │   │   ├── Categories.jsx          # Category management
│   │   │   ├── Budgets.jsx             # Monthly budget limits & progress
│   │   │   ├── Goals.jsx               # Financial goals & savings tracker
│   │   │   └── Profile.jsx             # User profile & password change
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PublicRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile                      # Production-ready frontend image
│   ├── nginx.conf                      # Nginx configuration
│   ├── nginx-default.conf              # Nginx routing & caching rules
│   └── .dockerignore                   # Docker build exclusions
│
├── backend/
│   ├── finance_tracker/
│   │   ├── settings.py                 # Env-driven config; supports SQLite & PostgreSQL
│   │   └── urls.py
│   ├── users/                          # Custom user model & auth
│   │   ├── models.py                   # CustomUser
│   │   ├── serializers.py              # Register & user serializers
│   │   ├── views.py                    # Register, profile, change password
│   │   ├── urls.py
│   │   └── utils.py                    # Budget alert email sending
│   ├── transactions/                   # Transaction model & CRUD API
│   ├── categories/                     # Category model & CRUD API
│   ├── budgets/                        # Budget model, spending calculation
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── goals/                          # Financial goals model & CRUD API
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── Dockerfile                      # Production-ready backend image
│   ├── .dockerignore                   # Docker build exclusions
│   ├── build.sh                        # Render build script (Blueprint)
│   ├── runtime.txt                     # Pins Python 3.12 on Render
│   └── manage.py
│
├── scripts/
│   ├── docker-build.sh                 # Build development images
│   ├── docker-build-prod.sh            # Build production images
│   ├── docker-start.sh                 # Start development stack
│   ├── docker-stop.sh                  # Stop containers
│   └── docker-rebuild.sh               # Rebuild from scratch
│
├── .github/
│   └── workflows/
│       └── docker.yml                  # CI/CD pipeline (image build & scan)
│
├── render.yaml                         # Render Blueprint config (backend + frontend + DB)
├── docker-compose.yml                  # Development environment
├── docker-com (for non-Docker setup)
- Node.js 20+ (for non-Docker setup)
- **OR** Docker Desktop (for containerized setup) — **Recommended** ✅

### Option A: Quick Start with Docker (Recommended)

**Get up and running in 2 minutes:**

```bash
# 1. Clone the repository
git clone https://github.com/susanacharya12/Finance_Tracker.git
cd Finance_Tracker

# 2. Set up environment
cp .env.example .env

# 3. Make scripts executable
chmod +x scripts/docker-*.sh

# 4. Start everything
make docker-up

# 5. Access the app
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# Admin:     http://localhost:8000/admin
# Database:  localhost:5432
```

**Common Docker commands:**
```bash
make docker-logs         # View container logs
make migrate            # Run migrations
make superuser          # Create admin user
make docker-down        # Stop containers
make docker-clean       # Remove containers & volumes
```

📖 **See [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) for more commands**

### Option B: Traditional Setup (Manual)

**Prerequisites:**
- Python 3.12+
- Node.js 20+

**Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/susanacharya12/Finance_Tracker.git
cd Finance_Tracker

# 2. Set up environment variables
cp .env.example .env
# Edit .env and fill in your values

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Install frontend dependencies
cd ../frontend
npm install

# 6. Start the backend (terminal 1)
cd ../backend
python manage.py runserver 0.0.0.0:8000

# 7. Start the frontend (terminal 2)
cd frontend
npm run dev
```

The app will be available at **http://localhost:5000**

---

## Development with Docker

This project includes production-ready Docker configuration for consistent development environments, easy deployment, and team onboarding.

### What's Included

✅ **Multi-container Setup:**
- React frontend with Nginx
- Django backend with Gunicorn
- PostgreSQL database
- Health checks & auto-restart

✅ **Security Features:**
- Non-root user execution
- Multi-stage builds for optimized images
- Security headers & SSL/TLS ready
- Image scanning in CI/CD pipeline

✅ **Developer Experience:**
- Auto-reload on code changes
- Hot module replacement (HMR)
- Easy database operations
- Comprehensive command shortcuts (Makefile)

✅ **Production Ready:**
- Rate limiting & caching
- Nginx reverse proxy configuration
- Environment-based deployments
- Disaster recovery guides

### Quick Setup

```bash
# Start development environment
make docker-up

# View logs
make docker-logs

# Stop containers
make docker-down
```

### Makefile Commands

```bash
# Docker Management
make docker-build              # Build images
make docker-up                 # Start containers
make docker-down               # Stop containers
make docker-logs               # View logs
make docker-clean              # Remove containers/volumes
make rebuild                   # Rebuild everything

# Database Operations
make migrate                   # Run migrations
make makemigrations            # Create migrations
make superuser                 # Create admin user
make db-backup                 # Backup database

# Development
make bash-backend              # Access backend shell
make db-shell                  # Access database
make test                      # Run tests
make lint                      # Check code quality
```

📖 **Full Docker Documentation:**
- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) — 2-minute quick start
- [DOCKER.md](DOCKER.md) — Complete Docker guide
- [DOCKER_WITH_RENDER.md](DOCKER_WITH_RENDER.md) — Render integration
- [DOCKER_SECURITY.md](DOCKER_SECURITY.md) — Security best practices

---

## Render Deployment

✅ **Existing Render deployment remains unaffected!**

Your project is currently deployed on [Render](https://render.com) and continues to work exactly as before. The new Docker files are for local development and optional future migrations — they don't interfere with your existing deployment.

### Current Deployment (No Changes Needed)

The project uses `render.yaml` for automatic deployment. When you push to GitHub:
1. Render detects changes
2. Reads `render.yaml` configuration
3. Auto-deploys backend, frontend, and database
4. No manual steps required

### Continue Using Current Setup

Your workflow remains unchanged:
```bash
# Development (with Docker locally)
make docker-up                 # Test locally
# ... make changes ...

# Deploy to Render
git add .
git commit -m "feature: add X"
git push origin main           # Render auto-deploys
```

**For detailed info on Docker + Render integration, see [DOCKER_WITH_RENDER.md](DOCKER_WITH_RENDER.md)**

---

## Email Setup (Budget Alerts)

Email is used only for budget alert notifications. Configure the following environment variables to enable real email delivery:

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST_USER` | SMTP username / Gmail address | `you@gmail.com` |
| `EMAIL_HOST_PASSWORD` | SMTP password / Gmail App Password | `abcd efgh ijkl mnop` |
| `DEFAULT_FROM_EMAIL` | Sender display name | `Finance Tracker <you@gmail.com>` |

> **Gmail tip:** Generate an [App Password](https://myaccount.google.com/apppasswords) under your Google account — never use your regular Gmail password. 2-Step Verification must be enabled on your Google account first.

### Development (no SMTP credentials)
When `EMAIL_HOST_PASSWORD` is not set, the app automatically switches to console mode — budget alert emails are printed to the backend terminal instead of being sent.

---

## API Endpoints

### Auth & Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/token/` | No | Obtain JWT access & refresh tokens (login) |
| POST | `/api/token/refresh/` | No | Refresh access token |
| POST | `/api/users/` | No | Register new user |
| GET / PATCH | `/api/users/me/` | Yes | Get or update current user profile |
| POST | `/api/change-password/` | Yes | Change password |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/categories/` | Yes | List or create categories |
| GET / PUT / DELETE | `/api/categories/{id}/` | Yes | Retrieve, update, or delete |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/transactions/` | Yes | List or create transactions |
| GET / PUT / DELETE | `/api/transactions/{id}/` | Yes | Retrieve, update, or delete |

### Budgets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/budgets/` | Yes | List or create budgets |
| GET / PUT / DELETE | `/api/budgets/{id}/` | Yes | Retrieve, update, or delete |
| GET | `/api/budgets/with-spending/?month=YYYY-MM` | Yes | Budgets with calculated spending |

### Goals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/goals/` | Yes | List or create goals |
| GET / PUT / DELETE | `/api/goals/{id}/` | Yes | Retrieve, update, or delete |

### Authentication header (all protected endpoints)
```
Authorization: Bearer <access_token>
```

---

## Deployment

Your project supports multiple deployment approaches:

### 1. Render (Current — Blueprint) ✅ **RECOMMENDED**

The project uses `render.yaml` for automatic deployment on [Render](https://render.com).

**No changes needed!** Your existing Render deployment continues to work as-is.

#### How It Works

1. Push code to GitHub
2. Render detects changes and reads `render.yaml`
3. Provisions backend service (Django), frontend service (React), and PostgreSQL database
4. Auto-deploys all services
5. No manual setup required

#### Environment Variables

`SECRET_KEY` and `DATABASE_URL` are generated/linked automatically by Render.

Optional variables you can set in Render dashboard:
- `SENDGRID_API_KEY` — For email budget alerts
- `DEBUG` — Set to `False` in production
- `ALLOWED_HOSTS` — Your domain (auto-set to `.onrender.com`)
- `CORS_ALLOWED_ORIGINS` — Frontend domain

#### First Deployment with Blueprint

1. Push the repo to GitHub
2. Go to [Render dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repository
4. Render reads `render.yaml` and provisions everything automatically
5. After deployment, services appear in your dashboard
6. Go to **finance-tracker-backend** service → **Environment** tab to add email credentials

### 2. Docker on Self-Hosted Server (Future Option)

When you're ready to migrate to Docker on a VPS or self-hosted server:

```bash
# Build production images
make prod-build

# Deploy with production stack
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

**Requirements:**
- Docker & Docker Compose installed
- SSL/TLS certificates
- Domain DNS pointing to your server
- PostgreSQL database configured

**See [DOCKER.md](DOCKER.md) and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete guide**

### 3. Local Development with Docker

Use Docker Compose for local development (see [Getting Started](#option-a-quick-start-with-docker-recommended) above).

---

## Data Models

### CustomUser
| Field | Type | Notes |
|-------|------|-------|
| email | EmailField | Unique; used as the login identifier |
| username | CharField | Full name |
| phone_number | CharField | Optional |
| profile_picture | ImageField | Optional |
| role | CharField | `user` or `admin` |
| is_active | BooleanField | `True` immediately after registration |

### Budget
| Field | Type | Notes |
|-------|------|-------|
| category | ForeignKey | Expense category |
| amount | DecimalField | Monthly spending limit |
| month | CharField | Format: `YYYY-MM` |

### Goal
| Field | Type | Notes |
|-------|------|-------|
| name | CharField | Goal description |
| target_amount | DecimalField | Total savings target |
| saved_amount | DecimalField | Amount saved so far |
| target_date | DateField | Optional deadline |
| status | CharField | `active`, `completed`, or `cancelled` |

---

## Contributing & Support

### Local Development Workflow

1. **Set up development environment:**
   ```bash
   make docker-up              # Start all services
   ```

2. **Make changes to code** — changes auto-reload in containers

3. **Run tests:**
   ```bash
   make test                   # Run all tests
   make lint                   # Check code quality
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "feature: description"
   git push origin main
   ```

5. **Render auto-deploys** — no additional steps needed

### Troubleshooting

#### Docker Issues

**Port already in use:**
```bash
make docker-down              # Stop all containers
make check-ports              # Check port availability
```

**Database connection error:**
```bash
make docker-logs-db           # Check database logs
docker-compose ps             # Verify containers running
```

**Build failures:**
```bash
docker-compose build --no-cache    # Rebuild without cache
make docker-logs                   # Check build output
```

**Clean slate:**
```bash
make docker-clean             # Remove everything
make docker-build             # Rebuild
make docker-up                # Start fresh
```

#### Render Deployment

**If deployment fails:**
1. Check Render dashboard for error messages
2. Verify `render.yaml` hasn't changed
3. Check recent code changes for errors
4. View Render logs in dashboard

**Common issues:**
- Incorrect environment variables → Set in Render dashboard
- Database not migrating → Check start command in `render.yaml`
- CORS errors → Update `CORS_ALLOWED_ORIGINS` in settings
- Email not sending → Add `SENDGRID_API_KEY` to environment

### Helpful Resources

📖 **Docker Documentation:**
- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) — Quick start guide
- [DOCKER.md](DOCKER.md) — Complete Docker documentation
- [DOCKER_SECURITY.md](DOCKER_SECURITY.md) — Security best practices
- [DOCKER_WITH_RENDER.md](DOCKER_WITH_RENDER.md) — Docker + Render integration

📋 **Deployment & DevOps:**
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) — Pre-deployment verification
- [DOCKER_SETUP_SUMMARY.md](DOCKER_SETUP_SUMMARY.md) — Complete Docker overview

🔗 **External Resources:**
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

## License

This project is open source and available under the [MIT License](LICENSE).
