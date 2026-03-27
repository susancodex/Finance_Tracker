# Finance Tracker – Frontend

React + Vite frontend for the Finance Tracker Django REST API.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `VITE_API_URL` to point to your Django backend (default: `http://localhost:8000`).

## Backend CORS

Make sure your Django backend allows requests from `http://localhost:5173`.
Install and configure `django-cors-headers`:

```python
# settings.py
INSTALLED_APPS = [..., 'corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
```

## Features

- JWT authentication (login / register / auto-refresh)
- Dashboard with income/expense summary
- Full CRUD for Transactions (filter by type)
- Full CRUD for Categories (card grid view)
- Responsive sidebar layout
- Dark theme with Tailwind CSS
