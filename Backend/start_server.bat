@echo off
echo ========================================
echo Starting Scopio Django Server
echo ========================================
echo.

REM Activate virtual environment
call ..\benv\Scripts\activate.bat

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo WARNING: DATABASE_URL not set in environment!
    echo Please create a .env file or set DATABASE_URL
    pause
)

REM Run migrations (safe to run multiple times)
echo Running migrations...
python manage.py migrate --noinput

REM Collect static files
echo Collecting static files...
python manage.py collectstatic --noinput --clear

REM Start the development server
echo.
echo ========================================
echo Server starting at http://localhost:8000
echo.
echo  Django Admin: http://localhost:8000/admin/
echo  API Root:     http://localhost:8000/api/
echo.
echo ========================================
echo.
python manage.py runserver 0.0.0.0:8000
