# Scopio Backend Documentation (Beginner-Friendly)

This folder explains how the backend of Scopio works in simple language.

If you are new to backend development, read in this order:

1. 00_backend_core_concepts.md
2. 01_architecture_overview.md
3. 02_request_lifecycle.md
4. 03_authentication_and_security.md
5. 04_data_models_and_business_entities.md
6. 05_feature_modules_and_functions.md

## What this backend is built with

- Framework: Django + Django REST Framework
- Authentication: JWT (SimpleJWT) + Session support
- OAuth: Google login via django-allauth
- Database: PostgreSQL (required through DATABASE_URL)
- Storage: Azure Blob (for profile images) with fallback behavior
- Caching: Redis (optional) with local-memory fallback
- Static serving: WhiteNoise

## Main backend apps

- main: project-level settings and root URLs
- api: user registration, auth APIs, profile APIs, CSRF and auth status APIs
- glogin: Google OAuth start/finalize/logout flow
- video: courses, lessons, progress, XP, streaks, notes, ratings, enrollments, leaderboard

This documentation is based on the real code in the Backend folder and is designed to explain both architecture and purpose, not just code syntax.

## What changed in this version

The documentation now explains concepts in a theory-first style, including:

- what each concept means
- why it exists in real systems
- common beginner misunderstandings
- how this exact backend applies it
