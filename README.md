# Scopio-WebApp

A web platform for Scopio, our IoT-powered EdTech startup. Built to blend smart IoT technology with education, enabling seamless interaction, real-time insights, and an engaging learning experience.

# Scopio - A Startup

Scopio is a small startup project focused on creating an online course platform tailored for Tamil-English (Tanglish) learners. We're starting with content made for our own department, but plan to grow from there.

## 👥 Team

We’re a group of 4 students building this from scratch:

- Vishal – Backend, DB, Git, Firebase
- Falin – Frontend(Design), Backend, Firebase, API
- Ashva – Payments, Auth, API, Project Management
- Ashif,Andrea,Rishi – Frontend(Development), Deployment, Auth

## 💡 What We're Building

- A web app where students can:
  - Sign up and log in
  - Browse and buy courses
  - Watch lectures in Tanglish
  - Take exams or submit projects
  - Get tracked progress and feedback

## 🛠️ Tech Stack

- **Frontend**: React JS
- **Backend**: Python (Django)
- **Database**: PostgreSQL
- **Cloud**: Firebase (for video, auth, etc.)
- **Payments**: Razorpay

## 🚧 Status

This is the early development phase. We’re currently setting up the structure and splitting tasks. Updates coming soon.

## 🔐 Google Login (OAuth2) Setup

Backend uses django-allauth + SimpleJWT with a server-side OAuth flow. Frontend triggers Google login via a redirect and receives JWT tokens via the URL hash.

- Prerequisites:
  - Put your Google OAuth credentials in `Backend/OAUTH.json` (already present).
  - Ensure callback URI is allowed in Google Cloud: `http://127.0.0.1:8000/accounts/google/login/callback/`.
- Backend setup:
  - Create and activate the venv in `Backend/benv`.
  - Configure the site and SocialApp via management command:
    - `cd Backend`
    - `python manage.py migrate`
    - `python manage.py createsuperuser` (optional for admin UI)
    - `python manage.py setup_google_oauth --site-domain 127.0.0.1:8000`
  - Optionally verify in admin: `/admin` → Sites (id=1) and Social applications → Google.
- Frontend setup:
  - Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` (e.g., `http://127.0.0.1:8000`).
  - Start dev server: `cd frontend` → `npm install` → `npm run dev`.
- Flow:
  - In Signup page, click the Google button. You’ll be redirected through `/accounts/google/login/` and back to `/glogin/google/finalize/`.
  - Backend issues JWT tokens and redirects to the frontend with `#access=...&refresh=...`.
  - Frontend stores tokens and switches to the welcome view.

For production, update `SITE_ID` domain, `FRONTEND_URL` in `Backend/.env`, and add your real domain to Google OAuth allowed redirect URIs.

