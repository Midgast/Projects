# Login Failed - Quick Fix

## The Problem
You're accessing the app at `localhost:3000` but the PHP backend needs to run on `localhost:8000`.

## Solution 1: Use PHP Server (Recommended)

1. **Stop any current server** on port 3000
2. **Start PHP server:**
   ```bash
   cd c:\Users\user\Projects-2\al-tamimi-college-system
   php -S localhost:8000
   ```
3. **Open browser:** `http://localhost:8000`
4. **Test login** with demo accounts

## Solution 2: Quick Test

1. **Open:** `http://localhost:8000/test_login.html`
2. **Click "Test Admin" button**
3. Should show "Login Successful"

## Solution 3: Check What's Running

If you see "Login failed", it means:

❌ PHP server isn't running on port 8000  
❌ Or you're still accessing via port 3000  

**Correct URL:** `http://localhost:8000` (not 3000)

## Demo Accounts
- Admin: admin@altamimi.edu / admin123
- Teacher: teacher1@altamimi.edu / teacher123  
- Student: student1@altamimi.edu / student123

## Step-by-Step Fix

1. Close any servers running on port 3000
2. Open Command Prompt in the project folder
3. Run: `php -S localhost:8000`
4. Open browser: `http://localhost:8000`
5. Try login with admin@altamimi.edu / admin123

The login will work when accessed through the PHP server!
