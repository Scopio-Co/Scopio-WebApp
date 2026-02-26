"""
Script to add sample course data to test video playback functionality
Run: python manage.py shell < add_sample_course.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from video.models import Course, Lesson

# Create or get sample course
course, created = Course.objects.get_or_create(
    title="React JS Masterclass",
    defaults={
        'description': 'Learn React JS from scratch with hands-on examples. Master components, hooks, state management, and more.',
        'thumbnail_url': 'https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg',
        'instructor_name': 'Web Dev Master',
        'instructor_title': 'Senior React Developer @TechCorp',
        'instructor_bio': 'Experienced software engineer with 10+ years in web development. Specialized in React, Node.js, and modern JavaScript frameworks.',
        'instructor_avatar_url': 'https://i.pravatar.cc/150?img=12',
        'what_you_learn': [
            'Core React concepts and fundamentals',
            'JSX syntax and component structure',
            'React Hooks (useState, useEffect, useContext)',
            'Component lifecycle and state management',
            'Building modern web applications'
        ],
        'prerequisites': 'Basic knowledge of HTML, CSS, and JavaScript',
        'rating': 4.7,
        'total_duration': '8 hours',
        'is_published': True
    }
)

if created:
    print(f"✓ Created course: {course.title}")
else:
    print(f"✓ Course already exists: {course.title}")
    # Update it
    Course.objects.filter(id=course.id).update(is_published=True)

# Add sample lessons with real YouTube videos
lessons_data = [
    {
        'title': 'Introduction to React JS',
        'video_url': 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
        'duration': '25:30',
        'time_xp': '450.00',
        'order': 1,
        'thumbnail_url': 'https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg'
    },
    {
        'title': 'Setting Up Your React Environment',
        'video_url': 'https://www.youtube.com/watch?v=SqcY0GlETPg',
        'duration': '18:45',
        'time_xp': '380.50',
        'order': 2,
        'thumbnail_url': 'https://img.youtube.com/vi/SqcY0GlETPg/hqdefault.jpg'
    },
    {
        'title': 'Components and Props',
        'video_url': 'https://www.youtube.com/watch?v=m7OWXtbiXX8',
        'duration': '32:15',
        'time_xp': '520.25',
        'order': 3,
        'thumbnail_url': 'https://img.youtube.com/vi/m7OWXtbiXX8/hqdefault.jpg'
    },
    {
        'title': 'Understanding React Hooks',
        'video_url': 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        'duration': '28:50',
        'time_xp': '485.75',
        'order': 4,
        'thumbnail_url': 'https://img.youtube.com/vi/O6P86uwfdR0/hqdefault.jpg'
    },
    {
        'title': 'State Management in React',
        'video_url': 'https://www.youtube.com/watch?v=35lXWvCuM8o',
        'duration': '35:20',
        'time_xp': '570.00',
        'order': 5,
        'thumbnail_url': 'https://img.youtube.com/vi/35lXWvCuM8o/hqdefault.jpg'
    }
]

for lesson_data in lessons_data:
    lesson, created = Lesson.objects.get_or_create(
        course=course,
        order=lesson_data['order'],
        defaults=lesson_data
    )
    if created:
        print(f"  ✓ Added lesson {lesson_data['order']}: {lesson_data['title']}")
    else:
        print(f"  ✓ Lesson {lesson_data['order']} already exists: {lesson_data['title']}")

print(f"\n✅ Sample course setup complete!")
print(f"   Course ID: {course.id}")
print(f"   Total lessons: {course.lessons.count()}")
print(f"\n   Access at: /api/video/courses/{course.id}/")
