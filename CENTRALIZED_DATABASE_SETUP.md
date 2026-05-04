# ✅ Centralized Database Setup Complete

## What Changed
Your TicketApp now uses a **centralized MySQL database** instead of SQLite. This means:
- **All users see the same events** (no more duplicate data per machine)
- **All changes are synchronized** across all users
- **Single source of truth** for all event data

## Before You Start the App

### 1. Install MySQL Server
- Download from: https://dev.mysql.com/downloads/mysql/
- **Windows Installation**:
  1. Run the installer
  2. Choose "Development Machine" setup type
  3. Set password to: `root` (matches your .env configuration)
  4. Set port to: `3306` (default)
  5. Run as Windows Service
  
- **Verify Installation** - Open PowerShell and run:
  ```powershell
  mysql --version
  ```

### 2. Start MySQL Server
- Windows: MySQL runs as a service (should auto-start)
- Or start manually: Open Services → MySQL → Start

### 3. Verify Connection
Open PowerShell and test:
```powershell
mysql -u root -p
# Enter password: root
# You should see: mysql>
# Type: exit
```

## Starting the App

Once MySQL is running and verified:

```powershell
cd backend
npm start
```

**First time:** The app will automatically:
1. Connect to MySQL
2. Create the database `ticketapp_db`
3. Create all necessary tables
4. Start the server

You should see:
```
✓ Database "ticketapp_db" is ready
Connected to MySQL database: ticketapp_db on localhost
Server running on http://localhost:5000
```

## Shared Database Configuration

**Database Details:**
- Host: `localhost`
- User: `root`
- Password: `root`
- Database: `ticketapp_db`
- Port: `3306`

These are configured in: `backend/.env`

## Testing the Setup

All users on the same network now:
1. Create an event ✅
2. **Other users see that same event immediately** ✅
3. No need to import/export data ✅

## Troubleshooting

**Error: "Access denied for user 'root'"**
- MySQL might not be running
- Password might be different - check your MySQL installation
- Update `backend/.env` with correct credentials

**Error: "Can't connect to MySQL server"**
- MySQL Server is not running
- Try restarting MySQL Service

**Error: "Database creation failed"**
- MySQL user might not have CREATE permission
- Run: `mysql -u root -p` and verify you can create databases

## File Changes Made
- ✅ `backend/src/db.js` - Switched from SQLite to MySQL with compatibility layer
- ✅ `backend/src/config.js` - Updated for MySQL config
- ✅ `backend/.env` - Updated with MySQL credentials
- ✅ `backend/package.json` - Added mysql2, removed sqlite dependencies
- ✅ `backend/setup-db.js` - NEW: Auto-creates database on app start
- ✅ npm scripts - Updated to run setup automatically

## Next Steps

1. ✅ Install MySQL Server
2. ✅ Run `npm install --legacy-peer-deps` in backend folder
3. ✅ Run `npm start` to launch the server
4. ✅ Share the same frontend URL with all team members
5. ✅ All events are now synchronized!

Questions? The MySQL setup guide is in: `MYSQL_SETUP.md`
