-- MySQL schema for TicketApp - Comprehensive Ticket Management System

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ticketapp_db;
USE ticketapp_db;

-- Identity/Users
CREATE TABLE IF NOT EXISTS Users (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  IsAdmin BOOLEAN NOT NULL DEFAULT 0,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Venues (Vendndodhjet)
CREATE TABLE IF NOT EXISTS Venues (
  VenueId INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(200) NOT NULL,
  Address VARCHAR(255) NOT NULL,
  City VARCHAR(100) NOT NULL,
  Capacity INT NOT NULL,
  Phone VARCHAR(20),
  Email VARCHAR(255),
  Description LONGTEXT,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events (Ngjarjet)
CREATE TABLE IF NOT EXISTS Events (
  EventId INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(200) NOT NULL,
  Description LONGTEXT,
  Category VARCHAR(50) NOT NULL,
  EventDate DATE NOT NULL,
  StartTime TIME,
  EndTime TIME,
  VenueId INT NOT NULL,
  Status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (VenueId) REFERENCES Venues(VenueId),
  INDEX idx_Events_VenueId (VenueId),
  INDEX idx_Events_Status (Status)
);

-- Sectors (Sektoret)
CREATE TABLE IF NOT EXISTS Sectors (
  SectorId INT AUTO_INCREMENT PRIMARY KEY,
  VenueId INT NOT NULL,
  SectorName VARCHAR(100) NOT NULL,
  Capacity INT NOT NULL,
  BasePrice DECIMAL(10,2) NOT NULL,
  Description LONGTEXT,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (VenueId) REFERENCES Venues(VenueId),
  INDEX idx_Sectors_VenueId (VenueId)
);

-- Tickets (Biletat)
CREATE TABLE IF NOT EXISTS Tickets (
  TicketId INT AUTO_INCREMENT PRIMARY KEY,
  EventId INT NOT NULL,
  SectorId INT NOT NULL,
  SeatNumber VARCHAR(20) NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  Status VARCHAR(50) NOT NULL DEFAULT 'Available',
  TicketType VARCHAR(50) NOT NULL DEFAULT 'General',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EventId) REFERENCES Events(EventId),
  FOREIGN KEY (SectorId) REFERENCES Sectors(SectorId),
  INDEX idx_Tickets_EventId (EventId),
  INDEX idx_Tickets_SectorId (SectorId),
  INDEX idx_Tickets_Status (Status)
);

-- Clients (Klientet)
CREATE TABLE IF NOT EXISTS Clients (
  ClientId INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Phone VARCHAR(20),
  Address VARCHAR(255),
  RegistrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders (Porositë)
CREATE TABLE IF NOT EXISTS Orders (
  OrderId INT AUTO_INCREMENT PRIMARY KEY,
  ClientId INT NOT NULL,
  OrderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  TotalAmount DECIMAL(10,2) NOT NULL,
  Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  PaymentMethod VARCHAR(50),
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
  INDEX idx_Orders_ClientId (ClientId),
  INDEX idx_Orders_Status (Status)
);

-- Order Details (Detajet_Porosise)
CREATE TABLE IF NOT EXISTS OrderDetails (
  DetailId INT AUTO_INCREMENT PRIMARY KEY,
  OrderId INT NOT NULL,
  TicketId INT NOT NULL,
  Quantity INT NOT NULL,
  UnitPrice DECIMAL(10,2) NOT NULL,
  TotalPrice DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
  FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId),
  INDEX idx_OrderDetails_OrderId (OrderId)
);

-- Payments (Pagesat)
CREATE TABLE IF NOT EXISTS Payments (
  PaymentId INT AUTO_INCREMENT PRIMARY KEY,
  OrderId INT NOT NULL,
  PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Amount DECIMAL(10,2) NOT NULL,
  PaymentMethod VARCHAR(50) NOT NULL,
  Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  Reference VARCHAR(100),
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
  INDEX idx_Payments_OrderId (OrderId),
  INDEX idx_Payments_Status (Status)
);

-- Organizers (Organizatoret)
CREATE TABLE IF NOT EXISTS Organizers (
  OrganizerId INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(200) NOT NULL,
  Email VARCHAR(255),
  Phone VARCHAR(20),
  Address VARCHAR(255),
  OrganizerType VARCHAR(50) NOT NULL,
  Description LONGTEXT,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event Organizers (Ngjarje_Organizator)
CREATE TABLE IF NOT EXISTS EventOrganizers (
  EventOrganizerId INT AUTO_INCREMENT PRIMARY KEY,
  EventId INT NOT NULL,
  OrganizerId INT NOT NULL,
  Role VARCHAR(100),
  Notes LONGTEXT,
  FOREIGN KEY (EventId) REFERENCES Events(EventId),
  FOREIGN KEY (OrganizerId) REFERENCES Organizers(OrganizerId),
  INDEX idx_EventOrganizers_EventId (EventId)
);

-- Discounts (Zbritjet)
CREATE TABLE IF NOT EXISTS Discounts (
  DiscountId INT AUTO_INCREMENT PRIMARY KEY,
  Code VARCHAR(50) NOT NULL UNIQUE,
  Description LONGTEXT,
  Percentage DECIMAL(5,2) NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  Status VARCHAR(50) NOT NULL DEFAULT 'Active',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ratings (Vleresimet)
CREATE TABLE IF NOT EXISTS Ratings (
  RatingId INT AUTO_INCREMENT PRIMARY KEY,
  EventId INT NOT NULL,
  ClientId INT NOT NULL,
  Rating INT NOT NULL,
  Comment LONGTEXT,
  RatingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EventId) REFERENCES Events(EventId),
  FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
  INDEX idx_Ratings_EventId (EventId),
  INDEX idx_Ratings_ClientId (ClientId)
);
