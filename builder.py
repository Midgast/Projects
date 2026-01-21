import os

# Имя корневой папки проекта
PROJECT_NAME = "college_project"

# Структура папок и файлов
structure = {
    "dirs": [
        "venv", # Просто папка, виртуальное окружение создадим позже командой
        "media/avatars",
        "media/homeworks",
        "media/news_covers",
        "static/css",
        "static/js",
        "static/img",
        "college_config",
        "core/migrations",
        "core/templates/core", # Вложенность для шаблонов
    ],
    "files": [
        "manage.py",
        "db.sqlite3",
        "requirements.txt",
        
        # Static
        "static/css/style.css",
        "static/js/tilt.js",
        "static/img/logo.svg",
        "static/img/background-noise.png",
        
        # Config (Настройки проекта)
        "college_config/__init__.py",
        "college_config/asgi.py",
        "college_config/settings.py",
        "college_config/urls.py",
        "college_config/wsgi.py",
        
        # App (Core)
        "core/__init__.py",
        "core/admin.py",
        "core/apps.py",
        "core/models.py",
        "core/urls.py",
        "core/views.py",
        "core/tests.py",
        "core/migrations/__init__.py",
        
        # Templates
        "core/templates/core/base.html",
        "core/templates/core/dashboard.html",
    ]
}

def create_structure():
    base_path = os.path.join(os.getcwd(), PROJECT_NAME)
    
    # 1. Создаем корневую папку
    if not os.path.exists(base_path):
        os.makedirs(base_path)
        print(f"✅ Создан корень: {PROJECT_NAME}/")
    else:
        print(f"ℹ️ Папка {PROJECT_NAME} уже есть, дополняем структуру...")

    # 2. Создаем папки
    for folder in structure["dirs"]:
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        print(f"  📂 {folder}")

    # 3. Создаем файлы
    for file in structure["files"]:
        file_path = os.path.join(base_path, file)
        # Убедимся, что папка для файла существует (на случай если забыли добавить в dirs)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        if not os.path.exists(file_path):
            with open(file_path, 'w', encoding='utf-8') as f:
                # Можно записать базовый комментарий, чтобы файл не был совсем пустым
                f.write(f"# File: {file}\n")
            print(f"  📄 {file}")
        else:
            print(f"  ℹ️ Файл существует: {file}")

if __name__ == "__main__":
    create_structure()
    print("\n🚀 Структура успешно создана точь-в-точь!")
    print(f"Теперь открой папку {PROJECT_NAME} в VS Code.")