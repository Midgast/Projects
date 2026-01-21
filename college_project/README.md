# College Project

Django-based web application for college management.

## Структура
- `apps/` — папка для приложений
- `core/` — основное приложение
- `static/` — статические файлы
- `templates/` — шаблоны
- `college_config/` — конфигурация проекта

## Запуск
```
python manage.py migrate
python manage.py runserver
```

## Требования
См. requirements.txt

## Деплой (быстрый маршрут — Render.com)

1. Залейте репозиторий на GitHub и подключите к Render.
2. В настройках сервиса задайте переменные окружения: `SECRET_KEY`, `DJANGO_SETTINGS_MODULE=college_config.settings`, `ALLOWED_HOSTS` (домен Render).
3. Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`.
4. Start Command: `gunicorn college_config.wsgi --log-file -`.

После деплоя проверьте страницы и настройте `ALLOWED_HOSTS` и `DEBUG=False` для продакшена.

## Локальная разработка (Windows PowerShell)

1. Скопируйте `.env.example` в `.env` и заполните нужные значения.
2. Запустите скрипт установки (создаст `.venv`, установит зависимости и применит миграции):

```powershell
.\dev_setup.ps1
```

3. Запустите сервер разработки:

```powershell
.\run_dev.ps1
```

Скрипты автоматически пропустят создание суперпользователя, если вы не задали `DJANGO_SUPERUSER_*` в окружении.

## Автоматический деплой через GitHub Actions -> Render

Я добавил workflow для GitHub Actions, который при пуше в `main` отправляет запрос на создание деплоя в Render.

## Публикация Docker-образа в GHCR
Альтернативно, проект теперь публикует Docker-образ в GitHub Container Registry (GHCR) при каждом пуше в `main`.

Запустите опубликованный образ локально (после завершения GitHub Actions):

```bash
docker pull ghcr.io/<your-github-org-or-username>/college_project:latest
docker run -e SECRET_KEY="change-me" -e DJANGO_SETTINGS_MODULE=college_config.settings -p 8000:8000 ghcr.io/<your-github-org-or-username>/college_project:latest
```

Замените `<your-github-org-or-username>` на ваше имя пользователя или организацию на GitHub. Вы можете запустить это на любом сервере, где установлен Docker.
Что нужно сделать на GitHub и в Render:

- Создайте сервис (Web Service) в Render, привязав ваш GitHub-репозиторий, или запомните `Service ID` существующего сервиса.
- В настройках репозитория на GitHub откройте `Settings` → `Secrets and variables` → `Actions` и добавьте следующие секреты:
	- `RENDER_API_KEY` — ваш API key из Render (Account → API Keys).
	- `RENDER_SERVICE_ID` — ID сервиса (пример: `srv-xxxxxxxxxxxxxxxx`).

После добавления секретов, при следующем пуше в `main` workflow автоматически вызовет деплой на Render.

Если хотите, могу вместо простого POST добавить шаги проверки статуса деплоя и уведомления в Slack/Telegram — скажите, какой вариант предпочитаете.

````
