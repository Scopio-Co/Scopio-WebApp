@echo off
echo =========================================
echo Checking Backend Database Connection
echo =========================================
echo.

cd Backend
call ..\benv\Scripts\activate.bat

echo Installing/Updating dependencies...
pip install -q -r requirements.txt

echo.
echo Testing database connection...
python manage.py check --database default

echo.
echo Checking for courses in database...
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings'); django.setup(); from video.models import Course, Lesson; print(f'✓ Courses: {Course.objects.count()}'); print(f'✓ Lessons: {Lesson.objects.count()}'); courses = Course.objects.all()[:5]; [print(f'  - ID {c.id}: {c.title} ({c.lessons.count()} lessons)') for c in courses] if courses.exists() else print('  No courses found - run add_sample_course.py to create sample data')"

echo.
echo =========================================
echo Test Complete!
echo =========================================
pause
