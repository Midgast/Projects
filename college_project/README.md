# College Core

Production-ready Django project for college management.

## Features
- Role-based dashboards (Student, Teacher, Admin)
- Notification system
- Idempotent seed command
- PostgreSQL-ready for production
- Static/media separation
- Custom error pages
- Apple-like UI/UX (HTML5, CSS3, Vanilla JS)
- Gunicorn + Nginx + HTTPS ready

## Setup
1. `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and fill in values
3. `python manage.py migrate`
4. `python manage.py seed` (idempotent)
5. `python manage.py runserver`

## Deployment
- Use Gunicorn and Nginx
- Set `DEBUG=False` and configure PostgreSQL in `.env`

## License
MIT
