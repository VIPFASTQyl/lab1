# MySQL Setup Guide for TicketApp

## Step 1: Install MySQL Server

### Windows
1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Run the installer and follow the setup wizard
3. Choose **Development Machine** installation type
4. Accept defaults (port 3306, MySQL 8.0)
5. During configuration:
   - Set MySQL Server Port: **3306**
   - Set MySQL Server to run as Windows Service
6. Create MySQL Root User Account:
   - Username: `root`
   - Password: `root` (or your preferred password)

### Verify Installation
Open PowerShell and run:
```powershell
mysql --version
```

## Step 2: Create Database and Tables

### Option A: Using MySQL Command Line (Easiest)
1. Open PowerShell as Administrator
2. Connect to MySQL:
```powershell
mysql -u root -p
```
3. When prompted, enter password: `root`

4. Copy and paste this into the MySQL prompt:
```sql
CREATE DATABASE IF NOT EXISTS ticketapp_db;
USE ticketapp_db;

-- Then paste the entire content of db-schema-mysql.sql file
```

### Option B: Using MySQL Workbench GUI
1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Open MySQL Workbench
3. Click "+" to create new connection
4. Name: `Local TicketApp`, Host: `localhost`, Port: `3306`, User: `root`
5. Click "Test Connection" and enter password `root`
6. Double-click the connection to open it
7. Go to File → Open SQL Script
8. Select `db-schema-mysql.sql`
9. Press Ctrl+Shift+Enter to execute

## Step 3: Install Backend Dependencies

```powershell
cd backend
npm install
```

This will install `mysql2/promise` driver.

## Step 4: Configure Environment (Optional)

Create a `.env` file in the `backend/` folder:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=ticketapp_db
JWT_SECRET=your_secret_key_here
```

## Step 5: Start Backend Server

```powershell
cd backend
npm run dev
```

Expected output:
```
> ticketapp-backend@1.0.0 dev
> node src/server.js

Connected to MySQL database
TicketApp API running on port 5000
```

## Step 6: Test Registration

1. Start the frontend:
```powershell
cd frontend
npm run dev
```

2. Open http://localhost:3000
3. Click "Register"
4. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm: password123
5. Click "Create Account"

Expected: ✅ "User registered" message

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
**Solution**: MySQL service is not running
- Windows: Restart MySQL service via Services app
- Command: `net start MySQL80` (or your MySQL version)

### Error: "Access denied for user 'root'@'localhost'"
**Solution**: Wrong password
- Check `.env` file DB_PASSWORD matches your MySQL password
- Or reset MySQL password: https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html

### Error: "Unknown database 'ticketapp_db'"
**Solution**: Database not created
- Run the SQL schema file in MySQL Workbench or command line

## Next Steps

After successful setup:
1. ✅ Login/Register works
2. ✅ All CRUD endpoints operational
3. Deploy to production

Need help? Check the error logs in the terminal where `npm run dev` is running.
