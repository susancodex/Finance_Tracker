# Finance Tracker

A full-stack personal finance management app for tracking income, expenses, budgets, and goals.

## Architecture

- **Backend**: Django 6 + Django REST Framework, served by Gunicorn on port 5000 (production) / 8000 (development)
- **Frontend**: React 18 + Vite + Tailwind CSS, served by Vite dev server on port 5000 (development), built into `frontend/dist/` for production
- **Database**: SQLite (development), PostgreSQL via `DATABASE_URL` env var (production)
- **Auth**: JWT via `djangorestframework-simplejwt`. Simple email + password authentication — no OTP or email verification required.

## Production Deployment (Replit Autoscale)

In production, Django serves **both** the API and the React SPA:
- **Build step**: builds the React app (`frontend/dist/`), then runs `collectstatic`
- **Run step**: runs migrations, then starts Gunicorn on port 5000
- **Static files**: Whitenoise serves `frontend/dist/` from the root URL (`WHITENOISE_ROOT`)
- **React Router**: Django catch-all (`re_path`) in `urls.py` returns `index.html` for all non-API routes
- **API proxy**: not needed in production — frontend and backend share the same domain

## Development

Two workflows run in parallel:
- **Backend API** — Django dev server on port 8000
- **Start application** — Vite dev server on port 5000, proxies `/api` and `/media` to port 8000

## Budget Alerts

When a user adds an expense transaction, the backend automatically checks if any budget threshold has been crossed:
- Each budget has a configurable `alert_threshold` (50/75/80/90/100%, default 80%)
- An email is sent when spending first crosses the threshold
- A second email is sent if spending crosses 100% (over budget)
- `last_notified_threshold` tracks which milestone was last emailed to prevent spam
- If spending drops back below the threshold (e.g., transaction deleted), the notification resets

**Signal wiring**: `budgets/apps.py` → `BudgetsConfig.ready()` connects `post_save`/`post_delete` on `Transaction` to `budgets/signals.py`.

## Email

Email is used only for budget alert notifications (no OTP or password reset emails).

- **Development**: Falls back to `console` backend when `EMAIL_HOST_PASSWORD` is not set
- **Production**: Configure `EMAIL_HOST_PASSWORD` or `SENDGRID_API_KEY` for real email delivery

## Key Files

- `backend/finance_tracker/settings.py` — Django settings (WHITENOISE_ROOT, CORS, JWT, email config)
- `backend/finance_tracker/urls.py` — URL routing including React catch-all
- `backend/users/utils.py` — Budget alert email sending logic
- `frontend/vite.config.js` — Vite dev server config with API proxy
