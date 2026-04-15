import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'ticketapp.db');

let db;

export async function getDbPool() {
  if (db) return db;
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Create tables if they don't exist
    await createTablesIfNotExist();
    
    console.log('Connected to SQLite database at:', dbPath);
    return db;
  } catch (err) {
    console.error('Error connecting to SQLite:', err);
    throw err;
  }
}

async function createTablesIfNotExist() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS Users (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      FirstName TEXT NOT NULL,
      LastName TEXT NOT NULL,
      Email TEXT UNIQUE NOT NULL,
      PasswordHash TEXT NOT NULL,
      IsAdmin INTEGER DEFAULT 0,
      PhoneNumber TEXT,
      Address TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS Venues (
      VenueId INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      City TEXT NOT NULL,
      Country TEXT NOT NULL,
      Capacity INTEGER,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS Sectors (
      SectorId INTEGER PRIMARY KEY AUTOINCREMENT,
      VenueId INTEGER NOT NULL,
      Name TEXT NOT NULL,
      Capacity INTEGER,
      FOREIGN KEY (VenueId) REFERENCES Venues(VenueId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS Events (
      EventId INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Description TEXT,
      EventDate DATETIME NOT NULL,
      VenueId INTEGER NOT NULL,
      OrgId INTEGER,
      AvailableTickets INTEGER,
      Price DECIMAL(10, 2),
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (VenueId) REFERENCES Venues(VenueId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS Tickets (
      TicketId INTEGER PRIMARY KEY AUTOINCREMENT,
      EventId INTEGER NOT NULL,
      Title TEXT NOT NULL,
      Description TEXT,
      Status TEXT,
      Priority TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS Clients (
      ClientId INTEGER PRIMARY KEY AUTOINCREMENT,
      FirstName TEXT NOT NULL,
      LastName TEXT NOT NULL,
      Email TEXT UNIQUE NOT NULL,
      PhoneNumber TEXT,
      Address TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS Orders (
      OrderId INTEGER PRIMARY KEY AUTOINCREMENT,
      ClientId INTEGER NOT NULL,
      OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      TotalAmount DECIMAL(10, 2),
      Status TEXT,
      FOREIGN KEY (ClientId) REFERENCES Clients(ClientId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS OrderDetails (
      OrderDetailId INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderId INTEGER NOT NULL,
      EventId INTEGER,
      Quantity INTEGER,
      UnitPrice DECIMAL(10, 2),
      FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
      FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS Payments (
      PaymentId INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderId INTEGER NOT NULL,
      Amount DECIMAL(10, 2),
      PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      Status TEXT,
      FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS Organizers (
      OrgId INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Type TEXT,
      Email TEXT,
      Phone TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS EventOrganizers (
      EventOrgId INTEGER PRIMARY KEY AUTOINCREMENT,
      EventId INTEGER NOT NULL,
      OrgId INTEGER NOT NULL,
      Role TEXT,
      FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE,
      FOREIGN KEY (OrgId) REFERENCES Organizers(OrgId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS Ratings (
      RatingId INTEGER PRIMARY KEY AUTOINCREMENT,
      EventId INTEGER NOT NULL,
      UserId INTEGER NOT NULL,
      Rating INTEGER,
      Comment TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE,
      FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS Discounts (
      DiscountId INTEGER PRIMARY KEY AUTOINCREMENT,
      Code TEXT UNIQUE NOT NULL,
      Percentage DECIMAL(5, 2),
      StartDate DATETIME,
      EndDate DATETIME,
      Status TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS Partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT,
      link TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS PurchasedTickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchaseId TEXT NOT NULL,
      ticketCode TEXT UNIQUE NOT NULL,
      oneTimeToken TEXT UNIQUE NOT NULL,
      ticketType TEXT NOT NULL,
      eventId INTEGER,
      eventTitle TEXT NOT NULL,
      holderName TEXT NOT NULL,
      purchaserEmail TEXT NOT NULL,
      purchased DATETIME DEFAULT CURRENT_TIMESTAMP,
      used INTEGER DEFAULT 0,
      usedAt DATETIME,
      scannedBy TEXT,
      scannedAt DATETIME
    )`
  ];
  
  for (const sql of tables) {
    await db.exec(sql);
  }
  
  // Add IsAdmin column to Users table if it doesn't exist (migration)
  try {
    await db.exec('ALTER TABLE Users ADD COLUMN IsAdmin INTEGER DEFAULT 0');
  } catch (err) {
    // Column already exists, ignore error
    if (!err.message.includes('duplicate column name')) {
      console.warn('Migration warning:', err.message);
    }
  }
}

export { db };
