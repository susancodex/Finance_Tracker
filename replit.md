# Finance Tracker

A full-stack personal finance management app for tracking income, expenses, budgets, and goals.

## Architecture

- **Backend**: Django 6 + Django REST Framework, served by Gunicorn on port 5000 (production) / 8000 (development)
- **Frontend**: React 18 + Vite + Tailwind CSS, served by Vite dev server on port 5000 (development), built into `frontend/dist/` for production
- **Database**: SQLite (development), PostgreSQL via `DATABASE_URL` env var (production)
- **Auth**: JWT via `djangorestframework-simplejwt`. Email OTP for registration and password reset.

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

## Email (OTP)

Email is used for account verification and password reset OTPs.

- **Development**: Falls back to `console` backend (OTPs printed to terminal) when `EMAIL_HOST_PASSWORD` is not set
- **Production**: Requires a working email backend. Gmail SMTP is blocked on Render's free tier.
  - **NOTE**: Resend integration was dismissed by user. To enable email in production, either:
    1. Complete the Replit Resend connector integration, OR
    2. Provide `RESEND_API_KEY` as a secret and implement the Resend HTTP backend in `backend/users/utils.py`

## Key Files

- `backend/finance_tracker/settings.py` — Django settings (WHITENOISE_ROOT, CORS, JWT, email config)
- `backend/finance_tracker/urls.py` — URL routing including React catch-all
- `backend/users/utils.py` — OTP generation and email sending logic
- `frontend/vite.config.js` — Vite dev server config with API proxy
