# Finance Tracker

A full-stack personal finance management web application built with **React + Vite** (frontend) and **Django REST Framework** (backend). Track income and expenses, manage categories, set monthly budget limits, and work toward financial goals — all from a clean, mobile-friendly interface.

**Author:** Susan Acharya

---

## Features

### Authentication & Security
- **JWT Authentication** — Secure login with access and refresh tokens; silent token refresh on expiry
- **Email OTP Verification** — New accounts require a 6-digit OTP before activation (valid 10 minutes)
- **Forgot Password via OTP** — Reset password with a code sent to your registered email
- **HTML email templates** — OTP emails use a branded HTML layout with a plain-text fallback
- **Console mode (dev)** — When no SMTP password is set, OTPs print to the backend console and are returned in the API response for easy local testing

### Registration
- Client-side validation: required email, minimum 6-character password, matching confirm password
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
- Color-coded alerts: green (safe), orange (near limit), red (over budget)
- Month navigation with prev/next arrows
- Summary totals: total limit, total spent, over-budget count

### Financial Goals
- Create savings goals with a name, target amount, and optional deadline
- Track saved amount with an animated progress bar
- Countdown shows days remaining (turns orange/red near deadline)
- Quick **Add Savings** button with preset amount chips (+$10, +$25, +$50…)
- Auto-marks goal as Completed when savings reach the target
- Status: Active, Completed, or Cancelled

### Profile
- Edit username and phone number
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
| Django 5 | Web framework |
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
│       │   ├── Login.jsx
│       │   ├── Register.jsx            # Registration with client-side validation
│       │   ├── VerifyEmail.jsx         # OTP email verification
│       │   ├── ForgotPassword.jsx      # Request password reset OTP
│       │   ├── ResetPassword.jsx       # Submit OTP + new password
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
│   ├── users/                          # Custom user model, OTP auth
│   │   ├── models.py                   # CustomUser + OTPVerification
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py                    # OTP generation & HTML email sending
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
│   ├── build.sh                        # Render build script
│   └── manage.py
│
├── render.yaml                         # Render deployment config (backend + frontend + DB)
├── Procfile                            # Process definition (web: gunicorn)
└── .env.example                        # All environment variable reference (backend + frontend)
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

## Email / OTP Setup

OTP emails are sent via Gmail SMTP. Configure the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST_USER` | Gmail address | `you@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `DEFAULT_FROM_EMAIL` | Sender display name | `Finance Tracker <you@gmail.com>` |
| `EMAIL_USE_SSL` | Use SSL instead of TLS | `false` (default) |

> **Gmail tip:** Generate an [App Password](https://myaccount.google.com/apppasswords) under your Google account — never use your regular Gmail password.

### Development (no SMTP credentials)
When `EMAIL_HOST_PASSWORD` is not set, the app automatically switches to console mode:
- The OTP is printed to the backend terminal
- The OTP is also returned in the registration / forgot-password API response so you can paste it directly into the verification form
- No real emails are sent

---

## Deployment (Render)

The project is configured for one-command deployment on [Render](https://render.com) via `render.yaml`.

### Services deployed
| Service | Type | Details |
|---------|------|---------|
| `finance-tracker-backend` | Web Service | Python 3.12, Gunicorn, auto-migrates on deploy |
| `finance-tracker-frontend` | Static Site | Vite build, served with cache headers |
| PostgreSQL | Managed DB | Auto-provisioned and linked to backend |

### Steps
1. Push the repo to GitHub
2. In Render dashboard → **New** → **Blueprint** → connect your repo
3. Render reads `render.yaml` and creates all services automatically
4. After deploy, set these environment variables in the backend service:

| Variable | Value |
|----------|-------|
| `EMAIL_HOST_USER` | your Gmail address |
| `EMAIL_HOST_PASSWORD` | your Gmail App Password |
| `DEFAULT_FROM_EMAIL` | `Finance Tracker <you@gmail.com>` |

The `SECRET_KEY` and `DATABASE_URL` are generated/linked automatically by Render.

---

## API Endpoints

### Auth & Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/token/` | No | Obtain JWT access & refresh tokens |
| POST | `/api/token/refresh/` | No | Refresh access token |
| POST | `/api/users/` | No | Register new user (triggers OTP email) |
| GET / PATCH | `/api/users/me/` | Yes | Get or update current user profile |
| POST | `/api/change-password/` | Yes | Change password |
| POST | `/api/verify-email/` | No | Verify email with OTP |
| POST | `/api/resend-otp/` | No | Resend verification OTP |
| POST | `/api/forgot-password/` | No | Request password reset OTP |
| POST | `/api/reset-password/` | No | Reset password using OTP |

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

## OTP Flow

### Registration
1. User fills the registration form — client validates email, password length, and password match
2. Account created with `is_active = False`
3. 6-digit OTP emailed (or printed to console in dev mode)
4. User enters OTP at `/verify-email` → account activated
5. User can now log in

### Forgot Password
1. User submits their email at `/forgot-password`
2. 6-digit OTP emailed (valid for **10 minutes**)
3. User enters OTP + new password at `/reset-password`
4. Password updated; login available immediately

---

## Data Models

### CustomUser
| Field | Type | Notes |
|-------|------|-------|
| email | EmailField | Unique; used as the login identifier |
| username | CharField | Display name |
| phone_number | CharField | Optional |
| profile_picture | ImageField | Optional |
| role | CharField | `user` or `admin` |
| is_active | BooleanField | `False` until email is verified |

### OTPVerification
| Field | Type | Notes |
|-------|------|-------|
| email | EmailField | Target address |
| otp | CharField | 6-digit code |
| otp_type | CharField | `registration` or `password_reset` |
| created_at | DateTimeField | Used to enforce 10-minute expiry |
| is_verified | BooleanField | Marked `True` after successful use |

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
