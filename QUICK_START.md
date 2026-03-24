# ✅ Backend MySQL Setup - Complete Guide

## ✨ What's Ready Now

✅ **Converted to MySQL:**
- `routes-auth.js` - Register / Login endpoints
- `routes-dashboard.js` - Analytics dashboard  
- Database connection configured for MySQL
- Schema file created (`db-schema-mysql.sql`)

⚙️ **Still Need Conversion** (for full API):
- `routes-events.js` - Events, Venues, Sectors CRUD
- `routes-tickets.js` - Tickets CRUD
- `routes-sales.js` - Sales, Clients, Orders CRUD
- `routes-extras.js` - Payments, Organizers, Discounts, Ratings CRUD
- `routes-relations.js` - Event-Organizers CRUD

---

## 🚀 Quick Start (5 minutes)

### 1. Install MySQL Server

**Windows:**
1. Download: https://dev.mysql.com/downloads/mysql/
2. Run installer → Select "Development Machine"
3. Follow defaults → Port 3306
4. Set root password: `root`
5. Install as Windows Service

Verify:
```powershell
mysql --version
```

### 2. Create Database

Open PowerShell and run:
```powershell
mysql -u root -p
```
Enter password: `root`

Then copy-paste ALL of this into MySQL:
```sql
CREATE DATABASE IF NOT EXISTS ticketapp_db;
USE ticketapp_db;

CREATE TABLE IF NOT EXISTS Users (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  IsAdmin BOOLEAN NOT NULL DEFAULT 0,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Users (Name, Email, PasswordHash, IsAdmin, CreatedAt) VALUES 
('Admin User', 'admin@ticketapp.com', '$2a$10$YIjlrTvxGxL0x0D.2YvPEOS0q7DQNrZgWmGBrYc/QOTy4m2wlCpJi', 1, NOW());
```

> Password hash above decodes to: `admin123`

### 3. Test Registration/Login

**Start Backend:**
```powershell
cd backend
npm run dev
```

Expected output:
```
Connected to MySQL database
TicketApp API running on port 5000
```

**Start Frontend:**
```powershell
cd frontend
npm run dev
```

**Test:**
1. Visit http://localhost:3000
2. Click **Register**
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click **Create Account**

✅ **Expected**: Registration successful, redirects to Events page

**Login Test:**
- Email: `admin@ticketapp.com`
- Password: `admin123`

---

## 📋 Route Status

### ✓ Ready to Use
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard/summary`

### ⏳ Needs SQL Conversion (can add later)
All other endpoints require converting from MSSQL to MySQL syntax

---

## 🔧 Next Steps

### If You Want All Routes Working

Option A: **I'll convert them (agent)**
- Just ask me to convert remaining routes
- Wait ~10-15 minutes
- All CRUD operations will work

Option B: **You convert them**
- Pattern is the same for all:
  - `pool.request()` → `pool.query()`
  - `sql.NVarChar` → Remove
  - `@paramName` → `?`
  - `.recordset` → First element of returned array
  - Example:
    ```javascript
    // MSSQL
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE Id = @id');
    const user = result.recordset[0];
    
    // MySQL
    const [results] = await pool.query('SELECT * FROM Users WHERE Id = ?', [id]);
    const user = results[0];
    ```

---

## ⚠️ Troubleshooting

### Error: "connect ECONNREFUSED"
MySQL is not running
```powershell
# Restart MySQL service
net start MySQL80
```

### Error: "Access denied for user 'root'"
Wrong password - check `.env` file or update password

### Error: "Unknown database"
Run the CREATE DATABASE command above

### Error on routes besides auth
Expected - they still use MSSQL syntax

---

## 📊 Database Info

- **Host**: localhost
- **Port**: 3306
- **Database**: `ticketapp_db`
- **User**: `root`
- **Password**: `root`

View data:
```powershell
mysql -u root -p ticketapp_db
```

```sql
SELECT * FROM Users;
SELECT * FROM Events;
SELECT * FROM Orders;
```

---

## ✅ Testing Checklist

- [ ] MySQL installed and running
- [ ] Database `ticketapp_db` created
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] ✅ Registration works
- [ ] ✅ Login works
- [ ] Admin dashboard loads

---

## 🎯 What to Do Now

1. **Install MySQL** (follow step 1 above)
2. **Create database** (follow step 2 above)
3. **Start backend** (`npm run dev`)
4. **Test registration** at http://localhost:3000

Let me know if you want me to convert the remaining routes!
