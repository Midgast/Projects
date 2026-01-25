# Setup Guide - College Management System

## Prerequisites
- Python 3.11+
- PostgreSQL (for production) or SQLite (for development)
- pip or virtualenv

## Development Setup

### 1. Clone and Navigate
```bash
cd college_project
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Copy `.env.example` to `.env` and update values:
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Important**: Change `SECRET_KEY` in `.env` to a secure random string!

### 5. Database Setup
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create cache table for performance
python manage.py createcachetable

# Or use the custom command
python manage.py setup_cache
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Create Sample Data (Optional)
```bash
python manage.py create_profiles
```

### 8. Run Development Server
```bash
python manage.py runserver
```

Visit: http://localhost:8000

## Production Deployment

### 1. Environment Variables
Set the following in production `.env`:
```
DEBUG=False
SECRET_KEY=<your-production-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 2. Database (PostgreSQL)
```bash
# Install PostgreSQL and create database
createdb college_db

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/college_db

# Run migrations
python manage.py migrate
python manage.py createcachetable
```

### 3. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### 4. Run with Gunicorn
```bash
gunicorn college_config.wsgi:application --bind 0.0.0.0:8000
```

### 5. Security Checklist
- [ ] Change SECRET_KEY to a secure random value
- [ ] Set DEBUG=False in production
- [ ] Configure proper ALLOWED_HOSTS
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set up proper logging and monitoring
- [ ] Regular database backups
- [ ] Keep dependencies updated

## Common Commands

### Database
```bash
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only!)
python manage.py flush
```

### User Management
```bash
# Create superuser
python manage.py createsuperuser

# Create test profiles
python manage.py create_profiles
```

### Static Files
```bash
# Collect static files
python manage.py collectstatic

# Clear cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

## Troubleshooting

### "django.core.exceptions.ImproperlyConfigured"
- Check that `.env` file exists and has correct values
- Ensure `django-environ` is installed

### Static files not loading
- Run `python manage.py collectstatic`
- Check STATIC_ROOT and STATIC_URL settings
- In development, ensure DEBUG=True

### Database errors
- Check DATABASE_URL in `.env`
- Run `python manage.py migrate`
- Ensure database exists and user has permissions

### Cache errors
- Run `python manage.py createcachetable`
- Check that cache_table exists in database

## Project Structure
```
college_project/
├── college_config/       # Project settings
│   ├── settings.py      # Main configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI config
├── core/                # Main application
│   ├── management/      # Custom management commands
│   ├── migrations/      # Database migrations
│   ├── templates/       # HTML templates
│   ├── admin.py         # Admin interface
│   ├── models.py        # Database models
│   ├── views.py         # View logic
│   ├── urls.py          # App URLs
│   ├── signals.py       # Database signals
│   └── services.py      # Business logic
├── static/              # Static files (CSS, JS, images)
├── media/               # User uploads
├── logs/                # Application logs
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment file
├── requirements.txt     # Python dependencies
└── manage.py            # Django management script
```

## Support
For issues or questions, check:
- Django documentation: https://docs.djangoproject.com/
- Project TODO.md for known issues
- Application logs in `logs/` directory
