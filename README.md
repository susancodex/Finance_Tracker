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

---

## Project Structure

```
Finance_Tracker/
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js                # Axios instance with JWT interceptors
│       ├── contexts/
│       │   ├── AuthContext.jsx         # Auth state (login, logout, register, user)
│       │   └── ToastContext.jsx        # Global toast notification system
│       ├── layouts/
│       │   └── AppLayout.jsx           # Sidebar + top bar + mobile bottom nav
│       ├── pages/
│       │   ├── Login.jsx               # Email + password login
│       │   ├── Register.jsx            # Full name, email, password signup
│       │   ├── Dashboard.jsx           # Overview & stats
│       │   ├── Transactions.jsx        # Income & expense log
│       │   ├── Categories.jsx          # Category management
│       │   ├── Budgets.jsx             # Monthly budget limits & progress
│       │   ├── Goals.jsx               # Financial goals & savings tracker
│       │   └── Profile.jsx             # User profile & password change
│       ├── routes/
│       │   ├── ProtectedRoute.jsx
│       │   └── PublicRoute.jsx
│       ├── App.jsx
│       └── main.jsx
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
│   ├── build.sh                        # Render build script (Blueprint)
│   ├── runtime.txt                     # Pins Python 3.12 on Render
│   └── manage.py
│
├── render.yaml                         # Render Blueprint config (backend + frontend + DB)
├── Procfile                            # Render manual web service config
├── requirements.txt                    # Root-level requirements (mirrors backend)
└── .env.example                        # All environment variable reference
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+

### 1. Clone the repository
```bash
git clone https://github.com/susanacharya12/Finance_Tracker.git
cd Finance_Tracker
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Run database migrations
```bash
python manage.py migrate
```

### 5. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 6. Start the backend (terminal 1)
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### 7. Start the frontend (terminal 2)
```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:5000**

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

## Deployment (Render)

The project supports two deployment approaches on [Render](https://render.com).

### Option A — Blueprint (recommended)

Uses `render.yaml` to create all services automatically.

1. Push the repo to GitHub
2. In Render dashboard → **New** → **Blueprint** → connect your repo
3. Render reads `render.yaml` and provisions the backend, frontend, and PostgreSQL database
4. After the first deploy, go to the **finance-tracker-backend** service → **Environment** and optionally add email credentials for budget alerts

> `SECRET_KEY` and `DATABASE_URL` are generated/linked automatically. `CORS_ALLOWED_ORIGINS` in `render.yaml` is pre-set to `https://finance-tracker-frontend.onrender.com` — update it if your service names differ.

### Option B — Manual Web Service

If you create services manually in Render (without Blueprint):

**Backend Web Service:**
- Environment: `Python`
- Root directory: *(leave blank — project root)*
- Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
- Start Command: `cd backend && python manage.py migrate --run-syncdb && python manage.py collectstatic --no-input && gunicorn finance_tracker.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
- Python Version: `3.12.0`
- Add all environment variables from `.env.example`

**Frontend Static Site:**
- Root directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish directory: `dist`
- Add env var: `VITE_API_URL` = your backend URL (e.g. `https://finance-tracker-backend.onrender.com`)

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

## License

This project is open source and available under the [MIT License](LICENSE).
