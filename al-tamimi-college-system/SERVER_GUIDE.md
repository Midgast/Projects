# AL TAMIMI College System - Server Guide

## Quick Start

### Development Mode
```bash
# Start all development servers (backend + frontend)
start_all_servers.bat

# Or using npm
npm run dev
```

### Production Mode
```bash
# Build frontend and start production backend
start_production.bat

# Or using npm
npm run build
npm start
```

### Check Server Status
```bash
# Check which servers are running
server_status.bat

# Or using npm
npm run status
```

## Server URLs

| Service | Development URL | Production URL |
|---------|----------------|----------------|
| Backend API | http://localhost:3001 | http://localhost:3001 |
| Frontend Dev | http://localhost:5173 | Served by backend |
| PHP Alternative | http://localhost:8000 | http://localhost:8000 |

## Available Scripts

- `start_all_servers.bat` - Starts backend and frontend in development mode
- `start_production.bat` - Builds frontend and starts production backend
- `start_server.bat` - Starts PHP development server (alternative)
- `server_status.bat` - Checks which servers are running

## Manual Server Control

### Backend Only
```bash
cd backend
npm run dev    # Development
npm start      # Production
```

### Frontend Only
```bash
cd frontend
npm run dev    # Development
npm run build  # Build for production
```

### PHP Server Only
```bash
php -S localhost:8000
```

## Requirements

- Node.js (v14 or higher)
- PHP (for PHP server option)
- PostgreSQL database (configured in backend/.env)

## Troubleshooting

1. **Port conflicts**: Make sure ports 3001, 5173, and 8000 are available
2. **Dependencies**: Run `npm run install-all` to install all dependencies
3. **Database**: Check backend/.env for database configuration
4. **Permissions**: Ensure you have administrator privileges if needed
