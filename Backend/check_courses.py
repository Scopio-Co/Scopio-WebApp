#!/usr/bin/env python
"""
Check courses and lessons with XP values in database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from video.models import Course, Lesson

courses = Course.objects.all()
print(f"\nTotal Courses: {courses.count()}\n")

for course in courses:
    lessons = course.lessons.all()
    print(f"Course: {course.title} (ID: {course.id})")
    print(f"  Published: {course.is_published}")
    print(f"  Lessons: {lessons.count()}")
    for lesson in lessons:
        print(f"    - {lesson.title}: {lesson.time_xp} XP")
    print()
