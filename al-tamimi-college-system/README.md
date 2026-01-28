# AL TAMIMI College System

Современная система управления образовательным учреждением на Node.js и React.

## Структура проекта

```
al-tamimi-college-system/
├── backend/          # Node.js API сервер
├── frontend/         # React приложение
├── package.json      # Корневые скрипты
└── README.md        # Этот файл
```

## Быстрый запуск

### Установка зависимостей
```bash
npm run install-all
```

### Запуск в режиме разработки
```bash
npm run dev
# или
start_all_servers.bat
```

### Запуск в продакшн режиме
```bash
npm run build
npm start
# или
start_production.bat
```

## Доступ к системе

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Технологии

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Аутентификация**: JWT
- **База данных**: PostgreSQL

## Доступ по умолчанию

- **Email**: admin@altamimi.edu
- **Пароль**: admin123
