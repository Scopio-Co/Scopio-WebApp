release: cd Backend && python manage.py migrate --noinput && python setup_production.py
web: cd Backend && gunicorn main.wsgi:application --workers 2 --threads 4 --timeout 60 --bind 0.0.0.0:$PORT --log-level info --access-logfile - --error-logfile -
