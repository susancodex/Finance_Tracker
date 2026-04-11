# Finance Tracker

A full-stack personal finance management web application built with **React + Vite** (frontend) and **Django REST Framework** (backend). Track income and expenses, manage categories, set monthly budget limits, and work toward financial goals — all from a clean, mobile-friendly interface.

---

## Features

### Authentication & Security
- **JWT Authentication** — Secure login with access and refresh tokens
- **Email OTP Verification** — New accounts require a 6-digit OTP before activation
- **Forgot Password via OTP** — Reset password with a code sent to your registered email
- **Real email delivery** — OTPs sent through Gmail SMTP (no console fallback in production)

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
| Django 6 | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT authentication |
| django-cors-headers | CORS handling |
| Pillow | Profile image processing |
| SQLite | Database |

---

## Project Structure

```
Finance_Tracker/
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js                # Axios instance with JWT interceptors
│       ├── contexts/
│       │   ├── AuthContext.jsx         # Auth state (login, logout, user)
│       │   └── ToastContext.jsx        # Global toast notification system
│       ├── layouts/
│       │   └── AppLayout.jsx           # Sidebar + top bar + mobile bottom nav
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
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
└── backend/
    ├── finance_tracker/
    │   ├── settings.py
    │   └── urls.py
    ├── users/                          # Custom user model, OTP auth
    │   ├── models.py                   # CustomUser + OTPVerification
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── utils.py                    # OTP generation & email sending
    ├── transactions/                   # Transaction model & CRUD API
    ├── categories/                     # Category model & CRUD API
    ├── budgets/                        # Budget model, spending calculation
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    ├── goals/                          # Financial goals model & CRUD API
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    └── manage.py
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

### 2. Install backend dependencies
```bash
cd backend
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow gunicorn
```

### 3. Run database migrations
```bash
python manage.py migrate
```

### 4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 5. Start the backend
```bash
cd backend
python manage.py runserver localhost:8000
```

### 6. Start the frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:5000**

---

## Email / OTP Setup

OTP emails are delivered via Gmail SMTP. Set the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |

The host, port, and sender address are already configured in `settings.py` for Gmail (`smtp.gmail.com:587`).

> **Gmail tip**: Use an [App Password](https://myaccount.google.com/apppasswords) — never your regular account password.

---

## API Endpoints

### Auth & Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/token/` | No | Obtain JWT access & refresh tokens |
| POST | `/api/token/refresh/` | No | Refresh access token |
| POST | `/api/users/` | No | Register new user (sends OTP) |
| GET / PATCH | `/api/users/me/` | Yes | Get or update current user profile |
| POST | `/api/change-password/` | Yes | Change password |
| POST | `/api/verify-email/` | No | Verify email with OTP |
| POST | `/api/resend-otp/` | No | Resend OTP |
| POST | `/api/forgot-password/` | No | Request password reset OTP |
| POST | `/api/reset-password/` | No | Reset password using OTP |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/categories/` | Yes | List or create categories |
| GET / PUT / DELETE | `/api/categories/{id}/` | Yes | Retrieve, update, or delete a category |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/transactions/` | Yes | List or create transactions |
| GET / PUT / DELETE | `/api/transactions/{id}/` | Yes | Retrieve, update, or delete a transaction |

### Budgets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/budgets/` | Yes | List or create budgets |
| GET / PUT / DELETE | `/api/budgets/{id}/` | Yes | Retrieve, update, or delete a budget |
| GET | `/api/budgets/with-spending/?month=YYYY-MM` | Yes | List budgets with calculated spending for a given month |

### Goals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / POST | `/api/goals/` | Yes | List or create goals |
| GET / PUT / DELETE | `/api/goals/{id}/` | Yes | Retrieve, update, or delete a goal |

### Authentication header (for all protected endpoints)
```
Authorization: Bearer <access_token>
```

---

## OTP Flow

### Registration
1. User submits registration form → account created with `is_active = False`
2. 6-digit OTP emailed (valid for **10 minutes**)
3. User enters OTP at `/verify-email` → account activated
4. User can now log in

### Forgot Password
1. User submits email at `/forgot-password`
2. 6-digit OTP emailed (valid for **10 minutes**)
3. User enters OTP + new password at `/reset-password`
4. Password updated, login available immediately

---

## Data Models

### CustomUser
| Field | Type | Notes |
|-------|------|-------|
| email | EmailField | Unique, used for login |
| username | CharField | Display name |
| phone_number | CharField | Optional |
| profile_picture | ImageField | Optional |
| role | CharField | `user` or `admin` |
| is_active | BooleanField | `False` until email verified |

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
