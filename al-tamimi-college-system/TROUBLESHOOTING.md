# Login Error Troubleshooting Guide

## Quick Fix Steps

### 1. Start the PHP Server
The most common issue is that the PHP server isn't running.

**Windows:**
```bash
# Double-click this file:
start_server.bat

# Or run in command prompt:
php -S localhost:8000
```

**Mac/Linux:**
```bash
php -S localhost:8000
```

### 2. Test the Login
Open your browser and go to: `http://localhost:8000/test_login.html`

This will test the login API directly and show you exactly what's happening.

### 3. Try the Main Application
If the test works, open: `http://localhost:8000/index.html`

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@altamimi.edu | admin123 |
| Teacher | teacher1@altamimi.edu | teacher123 |
| Student | student1@altamimi.edu | student123 |

## Common Issues and Solutions

### Issue: "Network error" or "Failed to fetch"
**Cause:** PHP server isn't running
**Solution:** Start the PHP server using `start_server.bat` or `php -S localhost:8000`

### Issue: "Invalid credentials"
**Cause:** Wrong email or password
**Solution:** Use the exact demo accounts listed above

### Issue: "Method not allowed"
**Cause:** Server configuration issue
**Solution:** Make sure the `.htaccess` file exists in the backend folder

### Issue: "Database error"
**Cause:** Database connection failed (only affects full login.php)
**Solution:** Use the simple login (login_simple.php) or set up the database

### Issue: PHP not found
**Cause:** PHP isn't installed or not in PATH
**Solution:** 
1. Install PHP from https://www.php.net/downloads.php
2. Add PHP to your system PATH
3. Restart your command prompt

## Testing Steps

1. **Start Server:** Run `start_server.bat`
2. **Test API:** Open `http://localhost:8000/test_login.html`
3. **Test Main App:** Open `http://localhost:8000/index.html`
4. **Try Login:** Use any demo account

## File Structure
```
al-tamimi-college-system/
├── index.html                 # Main application
├── test_login.html           # Login testing tool
├── start_server.bat          # Server starter (Windows)
├── backend/
│   ├── api/auth/
│   │   ├── login.php         # Full database login
│   │   └── login_simple.php  # Simple login (no database)
│   ├── config.php            # Database configuration
│   └── .htaccess             # Apache routing
└── TROUBLESHOOTING.md        # This file
```

## Advanced: Database Setup (Optional)

If you want to use the full database version:

1. **Install MySQL/MariaDB**
2. **Create database:** `CREATE DATABASE al_tamimi_college;`
3. **Import schema:** `mysql -u root -p al_tamimi_college < backend/database.sql`
4. **Update config.php** with your database credentials
5. **Change frontend** to use `login.php` instead of `login_simple.php`

## Still Having Issues?

1. Check browser console (F12) for JavaScript errors
2. Check PHP error logs
3. Make sure all files exist in the correct locations
4. Try a different browser
5. Clear browser cache

## Success Indicators

✅ Server starts without errors  
✅ `http://localhost:8000/test_login.html` loads  
✅ Login test shows "Login Successful"  
✅ Main application loads and login works  

If all these work, your login system is functioning correctly!
