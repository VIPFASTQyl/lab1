import mysql from 'mysql2/promise';
import { dbConfig } from './config.js';

let pool;
let dbWrapper;

export async function getDbPool() {
  if (dbWrapper) return dbWrapper;
  try {
    pool = await mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: dbConfig.waitForConnections,
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: dbConfig.queueLimit,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0
    });
    
    // Create tables if they don't exist
    await createTablesIfNotExist();
    
    console.log(`Connected to MySQL database: ${dbConfig.database} on ${dbConfig.host}`);
    
    // Create and return the SQLite-compatible wrapper
    dbWrapper = {
      async all(sql, params = []) {
        const conn = await pool.getConnection();
        try {
          const [rows] = await conn.execute(sql, params);
          return rows;
        } finally {
          await conn.release();
        }
      },

      async run(sql, params = []) {
        const conn = await pool.getConnection();
        try {
          const result = await conn.execute(sql, params);
          return {
            lastID: result[0].insertId,
            changes: result[0].affectedRows
          };
        } finally {
          await conn.release();
        }
      },

      async get(sql, params = []) {
        const conn = await pool.getConnection();
        try {
          const [rows] = await conn.execute(sql, params);
          return rows[0] || null;
        } finally {
          await conn.release();
        }
      },

      async exec(sql) {
        const conn = await pool.getConnection();
        try {
          await conn.execute(sql);
        } finally {
          await conn.release();
        }
      }
    };
    
    return dbWrapper;
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
}

async function createTablesIfNotExist() {
  const conn = await pool.getConnection();
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS Users (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(255) NOT NULL,
        LastName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) UNIQUE NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        IsAdmin INT DEFAULT 0,
        PhoneNumber VARCHAR(20),
        Address TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS Venues (
        VenueId INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        City VARCHAR(255) NOT NULL,
        Country VARCHAR(255) NOT NULL,
        Capacity INT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS Sectors (
        SectorId INT AUTO_INCREMENT PRIMARY KEY,
        VenueId INT NOT NULL,
        Name VARCHAR(255) NOT NULL,
        Capacity INT,
        FOREIGN KEY (VenueId) REFERENCES Venues(VenueId) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Events (
        EventId INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255) NOT NULL,
        Description TEXT,
        EventDate DATETIME NOT NULL,
        VenueId INT NOT NULL,
        OrgId INT,
        AvailableTickets INT,
        Price DECIMAL(10, 2),
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (VenueId) REFERENCES Venues(VenueId) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Tickets (
        TicketId INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        Title VARCHAR(255) NOT NULL,
        Description TEXT,
        Status VARCHAR(50),
        Priority VARCHAR(50),
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Clients (
        ClientId INT AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(255) NOT NULL,
        LastName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) UNIQUE NOT NULL,
        PhoneNumber VARCHAR(20),
        Address TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS Orders (
        OrderId INT AUTO_INCREMENT PRIMARY KEY,
        ClientId INT NOT NULL,
        OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        TotalAmount DECIMAL(10, 2),
        Status VARCHAR(50),
        FOREIGN KEY (ClientId) REFERENCES Clients(ClientId) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS OrderDetails (
        OrderDetailId INT AUTO_INCREMENT PRIMARY KEY,
        OrderId INT NOT NULL,
        EventId INT,
        Quantity INT,
        UnitPrice DECIMAL(10, 2),
        FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
        FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE SET NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS Payments (
        PaymentId INT AUTO_INCREMENT PRIMARY KEY,
        OrderId INT NOT NULL,
        Amount DECIMAL(10, 2),
        PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        Status VARCHAR(50),
        FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Organizers (
        OrgId INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Type VARCHAR(100),
        Email VARCHAR(255),
        Phone VARCHAR(20),
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS EventOrganizers (
        EventOrgId INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        OrgId INT NOT NULL,
        Role VARCHAR(100),
        FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE,
        FOREIGN KEY (OrgId) REFERENCES Organizers(OrgId) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Ratings (
        RatingId INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        UserId INT NOT NULL,
        Rating INT,
        Comment TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE,
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Discounts (
        DiscountId INT AUTO_INCREMENT PRIMARY KEY,
        Code VARCHAR(50) UNIQUE NOT NULL,
        Percentage DECIMAL(5, 2),
        StartDate DATETIME,
        EndDate DATETIME,
        Status VARCHAR(50),
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS Partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url TEXT,
        link TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS PurchasedTickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchaseId VARCHAR(255) NOT NULL,
        ticketCode VARCHAR(255) UNIQUE NOT NULL,
        oneTimeToken VARCHAR(255) UNIQUE NOT NULL,
        ticketType VARCHAR(100) NOT NULL,
        eventId INT,
        eventTitle VARCHAR(255) NOT NULL,
        holderName VARCHAR(255) NOT NULL,
        purchaserEmail VARCHAR(255) NOT NULL,
        purchased DATETIME DEFAULT CURRENT_TIMESTAMP,
        used INT DEFAULT 0,
        usedAt DATETIME,
        scannedBy VARCHAR(255),
        scannedAt DATETIME
      )`
    ];
    
    for (const sql of tables) {
      try {
        await conn.execute(sql);
      } catch (err) {
        // Table already exists, continue
        if (!err.message.includes('already exists')) {
          console.error('Error creating table:', err.message);
        }
      }
    }
  } finally {
    await conn.release();
  }
}
