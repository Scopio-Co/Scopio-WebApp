release: cd Backend && python manage.py migrate && python setup_production.py
web: cd Backend && gunicorn main.wsgi:application --bind 0.0.0.0:8000
